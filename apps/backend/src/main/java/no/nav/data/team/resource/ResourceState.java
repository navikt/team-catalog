package no.nav.data.team.resource;

import lombok.SneakyThrows;
import no.nav.data.team.resource.domain.Resource;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.TokenFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.miscellaneous.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.phonetic.DoubleMetaphoneFilter;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

class ResourceState {

    static final String FIELD_NAME = "name";
    static final String FIELD_IDENT = "ident";

    private static final Map<String, Resource> allResources = new HashMap<>(1 << 15);
    private static final Directory index = new ByteBuffersDirectory();
    private static final PerFieldAnalyzerWrapper analyzer;

    static {
        analyzer = new PerFieldAnalyzerWrapper(new Analyzer() {

            @Override
            @SneakyThrows
            protected TokenStreamComponents createComponents(String fieldName) {
                Tokenizer source = new StandardTokenizer();
                TokenStream result = new LowerCaseFilter(source);
                result = new DoubleMetaphoneFilter(result, 10, true);
                result = new TokenFilter(result) {
                    private final CharTermAttribute termAtt = addAttribute(CharTermAttribute.class);

                    @Override
                    public boolean incrementToken() throws IOException {
                        if (input.incrementToken()) {
                            termAtt.append('*');
                            return true;
                        } else {
                            return false;
                        }
                    }
                };
                return new TokenStreamComponents(source, result);
            }

        }, Map.of(FIELD_IDENT, new StandardAnalyzer()));
    }

    static Optional<Resource> get(String ident) {
        return Optional.ofNullable(allResources.get(ident.toUpperCase()));
    }

    static void put(Resource resource) {
        allResources.put(resource.getNavIdent().toUpperCase(), resource);
    }

    static int count() {
        return allResources.size();
    }

    static void clear() {
        allResources.clear();
    }

    @SneakyThrows
    static IndexReader createReader() {
        return DirectoryReader.open(index);
    }

    @SneakyThrows
    static IndexWriter createWriter() {
        IndexWriterConfig writerConfig = new IndexWriterConfig(getAnalyzer());
        return new IndexWriter(index, writerConfig);
    }

    static Analyzer getAnalyzer() {
        return analyzer;
    }
}
