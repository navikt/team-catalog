package no.nav.data.team.cluster;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.cluster.ClusterController.ClusterPageResponse;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.dto.ClusterMemberRequest;
import no.nav.data.team.cluster.dto.ClusterRequest;
import no.nav.data.team.cluster.dto.ClusterResponse;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;

public class ClusterControllerIT extends IntegrationTestBase {

    private ResourceResponse resouceZero;

    @BeforeEach
    void setUp() {
        resouceZero = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(0))).convertToResponse();
    }

    @Test
    void getCluster() {
        var cluster = storageService.save(Cluster.builder().name("name").build());
        ResponseEntity<ClusterResponse> resp = restTemplate.getForEntity("/cluster/{id}", ClusterResponse.class, cluster.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo(cluster.getName());
    }

    @Test
    void getAllClusters() {
        storageService.save(Cluster.builder().name("name1").build());
        storageService.save(Cluster.builder().name("name2").build());
        storageService.save(Cluster.builder().name("name3").build());
        ResponseEntity<ClusterPageResponse> resp = restTemplate.getForEntity("/cluster", ClusterPageResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(3L);
        assertThat(convert(resp.getBody().getContent(), ClusterResponse::getName)).contains("name1", "name2", "name3");
    }

    @Test
    void searchCluster() {
        storageService.save(Cluster.builder().name("the name").build());
        ResponseEntity<ClusterPageResponse> resp = restTemplate.getForEntity("/cluster/search/{search}", ClusterPageResponse.class, "name");

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void createCluster() {
        ClusterRequest cluster = createClusterRequest();
        ResponseEntity<ClusterResponse> resp = restTemplate.postForEntity("/cluster", cluster, ClusterResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        ClusterResponse body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getId()).isNotNull();
        assertThat(body.getChangeStamp()).isNotNull();
        body.setChangeStamp(null);
        assertThat(body).isEqualTo(ClusterResponse.builder()
                .id(body.getId())
                .name("name")
                .description("desc")
                .tags(List.of("tag"))
                .members(List.of(MemberResponse.builder()
                        .navIdent(createNavIdent(0))
                        .description("desc")
                        .resource(resouceZero)
                        .roles(List.of(TeamRole.LEAD))
                        .build()))
                .links(new Links("http://localhost:3000/cluster/" + body.getId()))
                .build());
    }

    @Test
    void createClusterFail_InvalidName() {
        ClusterRequest cluster = createClusterRequest();
        cluster.setName("");
        ResponseEntity<String> resp = restTemplate.postForEntity("/cluster", cluster, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("name -- fieldIsNullOrMissing");
    }

    @Test
    void updateCluster() {
        ClusterRequest cluster = createClusterRequest();
        ResponseEntity<ClusterResponse> createResp = restTemplate.postForEntity("/cluster", cluster, ClusterResponse.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResp.getBody()).isNotNull();

        UUID id = createResp.getBody().getId();
        cluster.setId(id.toString());
        cluster.setName("newname");
        ResponseEntity<ClusterResponse> resp = restTemplate.exchange("/cluster/{id}", HttpMethod.PUT, new HttpEntity<>(cluster), ClusterResponse.class, id);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo("newname");
    }

    @Test
    void deleteCluster() {
        var cluster = storageService.save(Cluster.builder().name("name").build());
        restTemplate.delete("/cluster/{id}", cluster.getId());
        assertThat(storageService.exists(cluster.getId(), "Cluster")).isFalse();
    }

    @Test
    void deleteClusterFail_ClusterHasTeams() {
        var cluster = storageService.save(Cluster.builder().name("name").build());
        storageService.save(Team.builder().clusterIds(List.of(cluster.getId())).build());

        ResponseEntity<String> resp = restTemplate.exchange("/cluster/{id}", HttpMethod.DELETE, HttpEntity.EMPTY, String.class, cluster.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(storageService.exists(cluster.getId(), "Cluster")).isTrue();
    }

    private ClusterRequest createClusterRequest() {
        return ClusterRequest.builder()
                .name("name")
                .description("desc")
                .tags(List.of("tag"))
                .members(List.of(ClusterMemberRequest.builder().navIdent(createNavIdent(0)).description("desc").roles(List.of(TeamRole.LEAD)).build()))
                .build();
    }
}
