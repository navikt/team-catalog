package no.nav.data.team.graph.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import org.springframework.util.Assert;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Network {

    private static final Pattern idFormat = Pattern.compile("^[a-zA-Z]+\\.[a-zA-Z0-9\\-]+$");

    @Singular
    private List<Edge> edges;
    @Singular
    private List<Vertex> vertices;

    public void cleanDuplicatesAndValidate() {
        edges = edges.stream().distinct().collect(Collectors.toList());
        vertices = vertices.stream().distinct().collect(Collectors.toList());

        Assert.isTrue(vertices.stream().allMatch(v -> testId(v.getId())), "Invalid vertex id detected");
        Assert.isTrue(edges.stream().allMatch(v -> testId(v.getInV())), "Invalid edgeInV id detected");
        Assert.isTrue(edges.stream().allMatch(v -> testId(v.getOutV())), "Invalid edgeOutV id detected");
    }

    private boolean testId(String id) {
        return idFormat.matcher(id).matches();
    }
}
