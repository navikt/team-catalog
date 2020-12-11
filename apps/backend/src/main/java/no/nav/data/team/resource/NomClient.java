package no.nav.data.team.resource;

import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceEvent;
import no.nav.data.team.resource.domain.ResourceEvent.EventType;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.resource.dto.NomRessurs;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field.Store;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.WildcardQuery;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.groupingBy;
import static no.nav.data.common.utils.StreamUtils.convert;
import static org.apache.lucene.queryparser.classic.QueryParserBase.escape;

@Slf4j
@Service
public class NomClient {

    private static final String FIELD_NAME = "name";
    private static final String FIELD_IDENT = "ident";
    private static final int MAX_SEARCH_RESULTS = 100;

    private static final Gauge gauge = MetricUtils.gauge()
            .name("nom_resources_gauge").help("Resources from nom indexed").register();
    private static final Gauge dbGauge = MetricUtils.gauge()
            .name("nom_resources_db_gauge").help("Resources from nom in db").register();
    private static final Counter counter = MetricUtils.counter()
            .name("nom_resources_read_counter").help("Resource events processed").register();
    private static final Counter discardCounter = MetricUtils.counter()
            .name("nom_resources_discard_counter").help("Resource events discarded").register();

    private final Map<String, Resource> allResources = new HashMap<>(1 << 15);
    private final Directory index = new ByteBuffersDirectory();
    private final StorageService storage;
    private final ResourceRepository resourceRepository;

    private static NomClient instance;

    public static NomClient getInstance() {
        return instance;
    }

    public NomClient(StorageService storage, ResourceRepository resourceRepository) {
        this.storage = storage;
        this.resourceRepository = resourceRepository;
        // Initialize index
        try (var writer = createWriter()) {
            writer.commit();
        } catch (Exception e) {
            throw new TechnicalException("io error", e);
        }
        instance = this;
    }

    public Optional<Resource> getByNavIdent(String navIdent) {
        return Optional.ofNullable(allResources.get(navIdent.toUpperCase()))
                .or(() -> resourceRepository.findByIdent(navIdent).map(GenericStorage::toResource).map(Resource::stale));
    }

    public String getNameForIdent(String navIdent) {
        return Optional.ofNullable(navIdent)
                .flatMap(this::getByNavIdent)
                .map(Resource::getFullName)
                .orElse(null);
    }

    public RestResponsePage<Resource> search(String searchString) {
        var esc = escape(searchString.toLowerCase().replace("-", " "));
        var bq = new BooleanQuery.Builder();
        Stream.of(esc.split(" "))
                .map(str -> new WildcardQuery(new Term(FIELD_NAME, str + "*")))
                .forEach(wq -> bq.add(wq, Occur.MUST));
        Query q = bq.build();
        try (var reader = DirectoryReader.open(index)) {
            IndexSearcher searcher = new IndexSearcher(reader);
            var top = searcher.search(q, MAX_SEARCH_RESULTS, Sort.RELEVANCE);
            log.debug("query '{}' hits {} returned {}", q.toString(), top.totalHits.value, top.scoreDocs.length);
            List<Resource> list = Stream.of(top.scoreDocs)
                    .map(sd -> getIdent(sd, searcher))
                    .map(navIdent -> getByNavIdent(navIdent).orElseThrow())
                    .collect(Collectors.toList());
            return new RestResponsePage<>(list, top.totalHits.value);
        } catch (IOException e) {
            log.error("Failed to read lucene index", e);
            throw new TechnicalException("Failed to read lucene index", e);
        }
    }

    public List<Resource> add(List<NomRessurs> nomResources) {
        try {
            var toSave = new ArrayList<Resource>();
            try (var writer = createWriter()) {
                Map<String, List<Resource>> existing = findResources(convert(nomResources, NomRessurs::getNavident));
                for (NomRessurs nomResource : nomResources) {
                    var resource = new Resource(nomResource);
                    ResourceStatus status = shouldSave(existing, resource);
                    if (status.shouldSave) {
                        toSave.add(resource);
                        if (status.previous != null) {
                            checkEvents(status.previous, resource);
                        }
                    }
                    allResources.put(resource.getNavIdent(), resource);

                    var luceneIdent = resource.getNavIdent().toLowerCase();
                    var identTerm = new Term(FIELD_IDENT, luceneIdent);
                    if (resource.getResourceType() == ResourceType.OTHER) {
                        // Other resource types shouldn't be searchable, they should not ordinarily be a part of teams
                        writer.deleteDocuments(identTerm);
                        discardCounter.inc();
                        continue;
                    }
                    Document doc = new Document();
                    String name = resource.getGivenName() + " " + resource.getFamilyName();
                    doc.add(new TextField(FIELD_NAME, name, Store.NO));
                    doc.add(new TextField(FIELD_IDENT, luceneIdent, Store.YES));
                    writer.updateDocument(identTerm, doc);
                    counter.inc();
                }
                storage.saveAll(toSave);
            }
            gauge.set(count());
            return toSave;
        } catch (IOException e) {
            log.error("Failed to write to index", e);
            throw new TechnicalException("Lucene error", e);
        }
    }

    private ResourceStatus shouldSave(Map<String, List<Resource>> existing, Resource resource) {
        var newest = existing.getOrDefault(resource.getNavIdent(), List.of()).stream().max(comparing(Resource::getOffset));
        boolean shouldSave = newest.isEmpty() || newest.get().getOffset() < resource.getOffset();
        return new ResourceStatus(shouldSave, newest.orElse(null));
    }

    private void checkEvents(Resource previous, Resource current) {
        if (!previous.isInactive() && current.isInactive()) {
            log.info("ident {} became inactive, creating ResourceEvent", current.getNavIdent());
            storage.save(ResourceEvent.builder().eventType(EventType.INACTIVE).ident(current.getNavIdent()).build());
        }
    }

    private Map<String, List<Resource>> findResources(List<String> idents) {
        return resourceRepository.findByIdents(idents).stream()
                .map(GenericStorage::toResource)
                .collect(groupingBy(Resource::getNavIdent));
    }

    public long count() {
        return allResources.size();
    }

    public long countDb() {
        return resourceRepository.count();
    }

    public void clear() {
        allResources.clear();
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT1M")
    public void metrics() {
        dbGauge.set(countDb());
    }

    @Scheduled(initialDelayString = "PT10M", fixedRateString = "PT10M")
    public void cleanup() {
        resourceRepository.cleanup();
    }

    private String getIdent(ScoreDoc sd, IndexSearcher searcher) {
        try {
            return searcher.doc(sd.doc).get(FIELD_IDENT);
        } catch (Exception e) {
            throw new TechnicalException("io error", e);
        }
    }

    private IndexWriter createWriter() {
        StandardAnalyzer analyzer = new StandardAnalyzer();
        IndexWriterConfig writerConfig = new IndexWriterConfig(analyzer);
        try {
            return new IndexWriter(index, writerConfig);
        } catch (Exception e) {
            throw new TechnicalException("io error", e);
        }
    }

    record ResourceStatus(boolean shouldSave, Resource previous) {

    }

    /**
     * For test
     */
    static void setInstance(NomClient client) {
        instance = client;
    }

}
