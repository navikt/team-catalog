package no.nav.data.team.resource;

import lombok.SneakyThrows;
import no.nav.data.team.resource.domain.Resource;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
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

    private static final Map<String, Resource> allResources = new HashMap<>(1 << 15);
    private static final Directory index = new ByteBuffersDirectory();

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
        StandardAnalyzer analyzer = new StandardAnalyzer();
        IndexWriterConfig writerConfig = new IndexWriterConfig(analyzer);
        return new IndexWriter(index, writerConfig);
    }
}
