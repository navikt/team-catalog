package no.nav.data.team.cluster;

import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.rest.StandardResponse;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.dto.ClusterMemberRequest;
import no.nav.data.team.cluster.dto.ClusterRequest;
import no.nav.data.team.cluster.dto.ClusterResponse;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;

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
        var resp = restTestClient.get().uri("/cluster/{id}", cluster.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo(cluster.getName());
    }

    @Test
    void getAllClusters() {
        storageService.save(activeClusterBuilder("name1").build());
        storageService.save(activeClusterBuilder("name2").build());
        storageService.save(activeClusterBuilder("name3").status(DomainObjectStatus.INACTIVE).build());
        storageService.save(activeClusterBuilder("name4").status(DomainObjectStatus.PLANNED).build());

        var resp = restTestClient.get().uri("/cluster")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<ClusterResponse>>() {})
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/cluster?status=ACTIVE,PLANNED,INACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<ClusterResponse>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp.getContent(), ClusterResponse::getName)).contains("name1", "name2", "name3", "name4");

        assertThat(resp2).isNotNull();
        assertThat(resp2.getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp2.getContent(), ClusterResponse::getName)).contains("name1", "name2", "name3", "name4");
    }

    @Test
    void getAllClustersByStatus() {
        storageService.save(activeClusterBuilder("name1").status(DomainObjectStatus.ACTIVE).build());
        storageService.save(activeClusterBuilder("name2").status(DomainObjectStatus.PLANNED).build());
        storageService.save(activeClusterBuilder("name3").status(DomainObjectStatus.INACTIVE).build());

        var resp = restTestClient.get().uri("/cluster?status=ACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<ClusterResponse>>() {})
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/cluster?status=PLANNED")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<ClusterResponse>>() {})
                .returnResult()
                .getResponseBody();
        var resp3 = restTestClient.get().uri("/cluster?status=INACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<ClusterResponse>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp.getContent(), ClusterResponse::getName)).contains("name1");

        assertThat(resp2).isNotNull();
        assertThat(resp2.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp2.getContent(), ClusterResponse::getName)).contains("name2");

        assertThat(resp3).isNotNull();
        assertThat(resp3.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp3.getContent(), ClusterResponse::getName)).contains("name3");
    }

    @Test
    void getAllClustersInvalidStatusParameters() {
        storageService.save(activeClusterBuilder("name1").status(DomainObjectStatus.ACTIVE).build());

        restTestClient.get().uri("/cluster?status=ACTIVE1")
                .exchange()
                .expectStatus().isBadRequest();
        restTestClient.get().uri("/cluster?status=ACTIVE,PLANNED,INACTIVE, EXTRA")
                .exchange()
                .expectStatus().isBadRequest();

    }

    private Cluster.ClusterBuilder activeClusterBuilder(String name) {
        return Cluster.builder().name(name).status(DomainObjectStatus.ACTIVE);
    }

    @Test
    void searchCluster() {
        storageService.save(Cluster.builder().name("the name").build());
        var resp = restTestClient.get().uri("/cluster/search/{search}", "name")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<ClusterResponse>>() {
                })
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void createCluster() {
        ClusterRequest cluster = createClusterRequest();
        var body = restTestClient.post().uri("/cluster")
                .body(cluster)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(body).isNotNull();
        assertThat(body.getId()).isNotNull();
        assertThat(body.getChangeStamp()).isNotNull();
        body.setChangeStamp(null);
        assertThat(body).isEqualTo(ClusterResponse.builder()
                .id(body.getId())
                .name("name")
                .description("desc")
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
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
        var resp = restTestClient.post().uri("/cluster")
                .body(cluster)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("name -- fieldIsNullOrMissing");
    }

    @Test
    void updateCluster() {
        ClusterRequest cluster = createClusterRequest();
        var createResp = restTestClient.post().uri("/cluster")
                .body(cluster)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();
        assertThat(createResp).isNotNull();

        UUID id = createResp.getId();
        cluster.setId(id.toString());
        cluster.setName("newname");
        var resp = restTestClient.put().uri("/cluster/{id}", id)
                .body(cluster)
                .exchange()
                .expectStatus().isOk()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo("newname");
    }

    @Test
    void deleteCluster() {
        var cluster = storageService.save(Cluster.builder().name("name").build());
        restTestClient.delete().uri("/cluster/{id}", cluster.getId())
                .exchange()
                .expectStatus().isOk();
        assertThat(storageService.exists(cluster.getId(), "Cluster")).isFalse();
    }

    @Test
    void deleteClusterFail_ClusterHasTeams() {
        var cluster = storageService.save(Cluster.builder().name("name").build());
        storageService.save(Team.builder().clusterIds(List.of(cluster.getId())).build());

        restTestClient.delete().uri("/cluster/{id}", cluster.getId())
                .exchange()
                .expectStatus().isBadRequest();
        assertThat(storageService.exists(cluster.getId(), "Cluster")).isTrue();
    }

    @Test
    void getClusterStatus() {
        var cluster1 = createClusterRequestWithStatus(DomainObjectStatus.ACTIVE, "cluster 1");
        var cluster2 = createClusterRequestWithStatus(DomainObjectStatus.INACTIVE, "cluster 2");
        var cluster3 = createClusterRequestWithStatus(DomainObjectStatus.PLANNED, "cluster 3");

        var post1 = restTestClient.post().uri("/cluster")
                .body(cluster1)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();
        var post2 = restTestClient.post().uri("/cluster")
                .body(cluster2)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();
        var post3 = restTestClient.post().uri("/cluster")
                .body(cluster3)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(post1).isNotNull();
        assertThat(post2).isNotNull();
        assertThat(post3).isNotNull();

        var resp1 = restTestClient.get().uri("/cluster/{id}", post1.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/cluster/{id}", post2.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();
        var resp3 = restTestClient.get().uri("/cluster/{id}", post3.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ClusterResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp1).isNotNull();
        assertThat(resp2).isNotNull();
        assertThat(resp3).isNotNull();

        assertThat(resp1.getStatus()).isEqualTo(DomainObjectStatus.ACTIVE);
        assertThat(resp2.getStatus()).isEqualTo(DomainObjectStatus.INACTIVE);
        assertThat(resp3.getStatus()).isEqualTo(DomainObjectStatus.PLANNED);
    }

    private ClusterRequest createClusterRequest() {
        return ClusterRequest.builder()
                .name("name")
                .description("desc")
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
                .members(List.of(ClusterMemberRequest.builder().navIdent(createNavIdent(0)).description("desc").roles(List.of(TeamRole.LEAD)).build()))
                .build();
    }

    private ClusterRequest createClusterRequestWithStatus(DomainObjectStatus status, String name) {
        return ClusterRequest.builder()
                .name(name)
                .description("desc")
                .tags(List.of("tag"))
                .status(status)
                .members(List.of(ClusterMemberRequest.builder().navIdent(createNavIdent(0)).description("desc").roles(List.of(TeamRole.LEAD)).build()))
                .build();
    }
}
