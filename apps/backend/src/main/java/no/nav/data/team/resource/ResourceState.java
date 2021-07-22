package no.nav.data.team.resource;

import lombok.SneakyThrows;
import no.nav.data.team.resource.domain.Resource;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.miscellaneous.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.ngram.EdgeNGramTokenFilter;
import org.apache.lucene.analysis.phonetic.DoubleMetaphoneFilter;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

class ResourceState {

    static final String FIELD_NAME = "name";
    static final String FIELD_IDENT = "ident";

    private static final Map<String, Resource> allResources = new HashMap<>(1 << 15);
    private static final Map<String, Resource> allResourcesByMail = new HashMap<>(1 << 15);
    private static Directory index = new ByteBuffersDirectory();
    private static final PerFieldAnalyzerWrapper analyzer;

    static {
        var analyzerPerField = new HashMap<String, Analyzer>();
        analyzerPerField.put(FIELD_IDENT, new StandardAnalyzer());
        analyzerPerField.put(FIELD_NAME, createPhoneticAnalyzer());
        analyzer = new PerFieldAnalyzerWrapper(new StandardAnalyzer(), analyzerPerField);
    }

    static Optional<Resource> get(String ident) {
        return Optional.ofNullable(allResources.get(ident.toUpperCase()));
    }

    static Optional<Resource> getByEmail(String email) {
        return Optional.ofNullable(allResourcesByMail.get(email.toLowerCase()));
    }

    static void put(Resource resource) {
        allResources.put(resource.getNavIdent().toUpperCase(), resource);
        if (resource.getEmail() != null) {
            allResourcesByMail.put(resource.getEmail().toLowerCase(), resource);
        }
    }

    static int count() {
        return allResources.size();
    }

    static void clear() {
        index = new ByteBuffersDirectory();
        allResources.clear();
        allResourcesByMail.clear();
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

    @SneakyThrows
    private static Analyzer createPhoneticAnalyzer(){
        return new Analyzer() {
            @Override
            @SneakyThrows
            protected TokenStreamComponents createComponents(String fieldName) {
                Tokenizer source = new StandardTokenizer();
                TokenStream result = new LowerCaseFilter(source);
                result = new EdgeNGramTokenFilter(result ,3,40,false);
                result = new DoubleMetaphoneFilter(result, 10, true);
                return new TokenStreamComponents(source, result);
            }
        };
    }
}
