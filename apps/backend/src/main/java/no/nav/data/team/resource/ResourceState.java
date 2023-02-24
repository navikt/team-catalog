package no.nav.data.team.resource;

import lombok.SneakyThrows;
import no.nav.data.team.resource.domain.Resource;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.core.WhitespaceTokenizer;
import org.apache.lucene.analysis.miscellaneous.ASCIIFoldingFilter;
import org.apache.lucene.analysis.miscellaneous.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.ngram.EdgeNGramTokenFilter;
import org.apache.lucene.analysis.phonetic.DoubleMetaphoneFilter;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

class ResourceState {

    static final String FIELD_IDENT = "ident";
    static final String FIELD_NAME_VERBATIM = "name_verbatim";
    static final String FIELD_NAME_NGRAMS = "name_ngrams";
    static final String FIELD_NAME_PHONETIC = "name_phonetic";

    private static final Map<String, Resource> allResources = new HashMap<>(1 << 15);
    private static final Map<String, Resource> allResourcesByMail = new HashMap<>(1 << 15);
    private static Directory index = new ByteBuffersDirectory();
    private static final PerFieldAnalyzerWrapper analyzer;

    static {
        var analyzerPerField = new HashMap<String, Analyzer>();
        analyzerPerField.put(FIELD_NAME_NGRAMS, createNGramAnalyzer());
        analyzerPerField.put(FIELD_NAME_PHONETIC, createMetaphoneAnalyzer());
        analyzer = new PerFieldAnalyzerWrapper(createSimpleIgnoreCaseAnalyzer(), analyzerPerField);
    }

    static Optional<Resource> get(String ident) {
        return Optional.ofNullable(allResources.get(ident.toUpperCase()));
    }

    static List<Resource> findAll(List<String> idents) {
        return allResources.values().stream().filter(r -> idents.contains(r.getNavIdent())).toList();
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
    private static Analyzer createNGramAnalyzer(){
        return new Analyzer() {
            @Override
            protected TokenStreamComponents createComponents(String fieldName) {
                Tokenizer source = new StandardTokenizer();
                TokenStream result = new LowerCaseFilter(source);
                result = new EdgeNGramTokenFilter(result ,3,40,false);
                return new TokenStreamComponents(source, result);
            }
        };
    }

    @SneakyThrows
    private static Analyzer createMetaphoneAnalyzer(){
        return new Analyzer() {
            @Override
            protected TokenStreamComponents createComponents(String fieldName) {
                Tokenizer source = new StandardTokenizer();
                TokenStream result = new LowerCaseFilter(source);
                result = new DoubleMetaphoneFilter(result ,10,false);
                return new TokenStreamComponents(source, result);
            }
        };
    }

    @SneakyThrows
    private static Analyzer createSimpleIgnoreCaseAnalyzer(){
        return new Analyzer() {
            @Override
            protected TokenStreamComponents createComponents(String fieldName) {
                Tokenizer source = new WhitespaceTokenizer();
                TokenStream result = new LowerCaseFilter(source);
                result = new ASCIIFoldingFilter(result);
                return new TokenStreamComponents(source, result);
            }
        };
    }
}
