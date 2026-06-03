package no.nav.data.team.member;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.domain.ClusterMember;
import no.nav.data.team.member.dto.MembershipResponse;
import no.nav.data.team.member.dto.SimpleMembershipObjectResponse;
import no.nav.data.team.member.dto.SimpleMembershipResponse;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.dto.TeamResponse;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static org.assertj.core.api.Assertions.assertThat;

class MemberControllerIT extends IntegrationTestBase {


    @Test
    void getMemberships() {
        String navIdent = "S123123";
        var productArea = ProductArea.builder().name("pa name1").members(List.of(PaMember.builder().navIdent(navIdent).build())).build();

        storageService.save(productArea);
        storageService.save(Team.builder().name("name1").members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("name2").members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("name3").build());

        var resp = restTestClient.get().uri("/member/membership/{ident}", navIdent)
                        .exchange().expectStatus().isOk().expectBody(MembershipResponse.class).returnResult();

        assertThat(resp.getResponseBody()).isNotNull();
        assertThat(resp.getResponseBody().getTeams().size()).isEqualTo(2L);
        assertThat(convert(resp.getResponseBody().getTeams(), TeamResponse::getName)).contains("name1", "name2");
        assertThat(resp.getResponseBody().getProductAreas().size()).isEqualTo(1L);
        assertThat(convert(resp.getResponseBody().getProductAreas(), ProductAreaResponse::getName)).contains("pa name1");
    }

    @Test
    void getSimpleMembershipsByUserEmail_returnsAllMembershipsByDefault() {
        var navIdent = "TESTUSER1";
        var email = "all.memberships@example.org";
        addNomResource(NomRessurs.builder().navident(navIdent).epost(email).fornavn("All").etternavn("Memberships").ressurstype("INTERN").build());

        storageService.save(Team.builder().name("team-active").status(DomainObjectStatus.ACTIVE)
                .members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("team-inactive").status(DomainObjectStatus.INACTIVE)
                .members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());

        storageService.save(ProductArea.builder().name("pa-active").status(DomainObjectStatus.ACTIVE)
                .members(List.of(PaMember.builder().navIdent(navIdent).build())).build());
        storageService.save(ProductArea.builder().name("pa-inactive").status(DomainObjectStatus.INACTIVE)
                .members(List.of(PaMember.builder().navIdent(navIdent).build())).build());

        storageService.save(Cluster.builder().name("cluster-active").status(DomainObjectStatus.ACTIVE)
                .members(List.of(ClusterMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Cluster.builder().name("cluster-inactive").status(DomainObjectStatus.INACTIVE)
                .members(List.of(ClusterMember.builder().navIdent(navIdent).build())).build());

        var resp = restTestClient.post().uri("/member/simpleMemberships/byUserEmail")
                .body(List.of(email))
                .exchange().expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<List<SimpleMembershipResponse>>() {})
                .returnResult().getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp).hasSize(1);
        var memberships = resp.getFirst();
        assertThat(convert(memberships.getTeams(), SimpleMembershipObjectResponse::getName)).contains("team-active", "team-inactive");
        assertThat(convert(memberships.getProductAreas(), SimpleMembershipObjectResponse::getName)).contains("pa-active", "pa-inactive");
        assertThat(convert(memberships.getClusters(), SimpleMembershipObjectResponse::getName)).contains("cluster-active", "cluster-inactive");
    }

    @Test
    void getSimpleMembershipsByUserEmail_filtersOnlyActiveMemberships() {
        var navIdent = "TESTUSER2";
        var email = "active.memberships@example.org";
        addNomResource(NomRessurs.builder().navident(navIdent).epost(email).fornavn("Active").etternavn("Memberships").ressurstype("INTERN").build());

        storageService.save(Team.builder().name("team-active").status(DomainObjectStatus.ACTIVE)
                .members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("team-inactive").status(DomainObjectStatus.INACTIVE)
                .members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());

        storageService.save(ProductArea.builder().name("pa-active").status(DomainObjectStatus.ACTIVE)
                .members(List.of(PaMember.builder().navIdent(navIdent).build())).build());
        storageService.save(ProductArea.builder().name("pa-inactive").status(DomainObjectStatus.INACTIVE)
                .members(List.of(PaMember.builder().navIdent(navIdent).build())).build());

        storageService.save(Cluster.builder().name("cluster-active").status(DomainObjectStatus.ACTIVE)
                .members(List.of(ClusterMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Cluster.builder().name("cluster-inactive").status(DomainObjectStatus.INACTIVE)
                .members(List.of(ClusterMember.builder().navIdent(navIdent).build())).build());

        var resp = restTestClient.post().uri("/member/simpleMemberships/byUserEmail?onlyActive=true")
                .body(List.of(email))
                .exchange().expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<List<SimpleMembershipResponse>>() {})
                .returnResult().getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp).hasSize(1);
        var memberships = resp.getFirst();
        assertThat(convert(memberships.getTeams(), SimpleMembershipObjectResponse::getName)).containsExactly("team-active");
        assertThat(convert(memberships.getProductAreas(), SimpleMembershipObjectResponse::getName)).containsExactly("pa-active");
        assertThat(convert(memberships.getClusters(), SimpleMembershipObjectResponse::getName)).containsExactly("cluster-active");
    }
}

