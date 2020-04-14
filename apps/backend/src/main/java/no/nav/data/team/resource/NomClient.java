package no.nav.data.team.resource;

import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.TechnicalException;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.common.utils.MetricUtils;
import no.nav.data.team.resource.domain.Resource;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.apache.lucene.queryparser.classic.QueryParserBase.escape;

@Slf4j
@Service
public class NomClient {

    private static final String FIELD_NAME = "name";
    private static final String FIELD_IDENT = "ident";
    private static final int MAX_SEARCH_RESULTS = 100;

    private static Gauge gauge = MetricUtils.gauge()
            .name("nom_resources_gauge").help("Resources from nom indexed").register();
    private static Counter counter = MetricUtils.counter()
            .name("nom_resources_read_counter").help("Resource events processed").register();

    private final Map<String, Resource> allResources = new HashMap<>();
    private final Directory index = new ByteBuffersDirectory();

    private static NomClient instance;

    public static NomClient getInstance() {
        return instance;
    }

    @SneakyThrows
    public NomClient() {
        // Initialize index
        try (var writer = createWriter()) {
            writer.commit();
        }
        instance = this;
    }

    public Resource getByNavIdent(String navIdent) {
        return allResources.get(navIdent.toUpperCase());
    }

    public String getNameForIdent(String navIdent) {
        return Optional.ofNullable(navIdent)
                .map(this::getByNavIdent)
                .map(Resource::getFullName)
                .orElse(null);
    }

    public RestResponsePage<Resource> search(String searchString) {
        var esc = escape(searchString.toLowerCase());
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
                    .map(this::getByNavIdent)
                    .collect(Collectors.toList());
            return new RestResponsePage<>(list, top.totalHits.value);
        } catch (IOException e) {
            log.error("Failed to read lucene index", e);
            throw new TechnicalException("Failed to read lucene index", e);
        }
    }

    public void add(List<Resource> resources) {
        try {
            try (var writer = createWriter()) {
                for (Resource resource : resources) {
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
            gauge.set(allResources.size());
        } catch (IOException e) {
            log.error("Failed to write to index", e);
            throw new TechnicalException("Lucene error", e);
        }
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
