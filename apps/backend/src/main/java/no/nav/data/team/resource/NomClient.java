package no.nav.data.team.resource;

import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.TechnicalException;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.utils.MetricUtils;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceRepository;
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
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.groupingBy;
import static no.nav.data.team.common.utils.StreamUtils.convert;
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

    private final Map<String, Resource> allResources = new HashMap<>(1 << 16);
    private final Directory index = new ByteBuffersDirectory();
    private final StorageService storage;
    private final ResourceRepository resourceRepository;

    private static NomClient instance;

    public static NomClient getInstance() {
        return instance;
    }

    @SneakyThrows
    public NomClient(StorageService storage, ResourceRepository resourceRepository) {
        this.storage = storage;
        this.resourceRepository = resourceRepository;
        // Initialize index
        try (var writer = createWriter()) {
            writer.commit();
        }
        instance = this;
    }

    public Optional<Resource> getByNavIdent(String navIdent) {
        return Optional.ofNullable(allResources.get(navIdent.toUpperCase()))
                .or(() -> resourceRepository.findByIdent(navIdent).map(GenericStorage::toResource));
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

    public void add(List<NomRessurs> nomResources) {
        try {
            try (var writer = createWriter()) {

                Map<String, List<Resource>> existing = resourceRepository
                        .findByIdents(convert(nomResources, NomRessurs::getNavident)).stream()
                        .map(GenericStorage::toResource)
                        .collect(groupingBy(Resource::getNavIdent));

                for (NomRessurs nomResource : nomResources) {
                    // race condition work around, will rewrite this later
                    List<Resource> resources = existing.getOrDefault(nomResource.getNavident(), List.of());
                    resources.sort(Comparator.comparing(r -> r.getChangeStamp().getCreatedDate()));
                    if (resources.size() > 1) {
                        resources.subList(1, resources.size()).forEach(r -> storage.softDelete(r.getId(), Resource.class));
                    }

                    Optional<Resource> existingResource = Optional.ofNullable(resources.isEmpty() ? null : resources.get(0));
                    var resource = existingResource.orElse(new Resource()).merge(nomResource);

                    // Lets not rewrite if it's fairly fresh or a different node recently saved it
                    if (existingResource.isEmpty() || existingResource.get().getLastReadTime().isBefore(LocalDateTime.now().minusHours(1))) {
                        storage.save(resource);
                    }

                    allResources.put(resource.getNavIdent().toUpperCase(), resource);
                    Document doc = new Document();
                    String name = resource.getGivenName() + " " + resource.getFamilyName();
                    String ident = resource.getNavIdent().toLowerCase();
                    doc.add(new TextField(FIELD_NAME, name, Store.NO));
                    doc.add(new TextField(FIELD_IDENT, ident, Store.YES));
                    writer.updateDocument(new Term(FIELD_IDENT, ident), doc);
                    counter.inc();
                }
            }
            gauge.set(count());
            dbGauge.set(countDb());
        } catch (IOException e) {
            log.error("Failed to write to index", e);
            throw new TechnicalException("Lucene error", e);
        }
    }

    public long count() {
        return allResources.size();
    }

    public long countDb() {
        return storage.count(Resource.class);
    }

    public void clear() {
        allResources.clear();
    }

    @SneakyThrows
    private String getIdent(ScoreDoc sd, IndexSearcher searcher) {
        return searcher.doc(sd.doc).get(FIELD_IDENT);
    }

    @SneakyThrows
    private IndexWriter createWriter() {
        StandardAnalyzer analyzer = new StandardAnalyzer();
        IndexWriterConfig writerConfig = new IndexWriterConfig(analyzer);
        return new IndexWriter(index, writerConfig);
    }
}
