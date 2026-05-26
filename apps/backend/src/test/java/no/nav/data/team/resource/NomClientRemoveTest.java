package no.nav.data.team.resource;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.domain.ClusterMember;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class NomClientRemoveTest extends IntegrationTestBase {

    private static final String IDENT_TO_REMOVE = "X900001";
    private static final String IDENT_TO_KEEP = "X900002";
    private static final String FID_TO_REMOVE = "fid-remove-1";

    @BeforeEach
    void setUp() {
        nomClient.add(List.of(
                NomRessurs.builder().navident(IDENT_TO_REMOVE).fid(FID_TO_REMOVE).fornavn("Ola").etternavn("Normann").ressurstype("INTERN").build(),
                NomRessurs.builder().navident(IDENT_TO_KEEP).fid("fid-keep-1").fornavn("Kari").etternavn("Normann").ressurstype("INTERN").build()
        ));
    }

    @Test
    void remove_shouldRemoveMembersFromTeam() {
        Team team = storageService.save(Team.builder()
                .members(new ArrayList<>(List.of(
                        TeamMember.builder().navIdent(IDENT_TO_REMOVE).build(),
                        TeamMember.builder().navIdent(IDENT_TO_KEEP).build()
                )))
                .build());

        var removed = nomClient.remove(List.of(FID_TO_REMOVE));

        assertThat(removed).hasSize(1);
        assertThat(removed.getFirst().getNavIdent()).isEqualTo(IDENT_TO_REMOVE);
        Team updated = storageService.get(team.getId(), Team.class);
        assertThat(updated.getMembers()).extracting("navIdent").containsExactly(IDENT_TO_KEEP);
    }

    @Test
    void remove_shouldClearContactPersonIdent() {
        Team team = storageService.save(Team.builder()
                .contactPersonIdent(IDENT_TO_REMOVE)
                .teamOwnerIdent(IDENT_TO_KEEP)
                .members(new ArrayList<>())
                .build());

        nomClient.remove(List.of(FID_TO_REMOVE));

        Team updated = storageService.get(team.getId(), Team.class);
        assertThat(updated.getContactPersonIdent()).isNull();
        assertThat(updated.getTeamOwnerIdent()).isEqualTo(IDENT_TO_KEEP);
    }

    @Test
    void remove_shouldClearTeamOwnerIdent() {
        Team team = storageService.save(Team.builder()
                .teamOwnerIdent(IDENT_TO_REMOVE)
                .members(new ArrayList<>())
                .build());

        nomClient.remove(List.of(FID_TO_REMOVE));

        Team updated = storageService.get(team.getId(), Team.class);
        assertThat(updated.getTeamOwnerIdent()).isNull();
    }

    @Test
    void remove_shouldRemoveMembersFromCluster() {
        Cluster cluster = storageService.save(Cluster.builder()
                .members(new ArrayList<>(List.of(
                        ClusterMember.builder().navIdent(IDENT_TO_REMOVE).build(),
                        ClusterMember.builder().navIdent(IDENT_TO_KEEP).build()
                )))
                .build());

        nomClient.remove(List.of(FID_TO_REMOVE));

        Cluster updated = storageService.get(cluster.getId(), Cluster.class);
        assertThat(updated.getMembers()).extracting("navIdent").containsExactly(IDENT_TO_KEEP);
    }

    @Test
    void remove_shouldRemoveMembersFromProductArea() {
        ProductArea pa = storageService.save(ProductArea.builder()
                .members(new ArrayList<>(List.of(
                        PaMember.builder().navIdent(IDENT_TO_REMOVE).build(),
                        PaMember.builder().navIdent(IDENT_TO_KEEP).build()
                )))
                .build());

        nomClient.remove(List.of(FID_TO_REMOVE));

        ProductArea updated = storageService.get(pa.getId(), ProductArea.class);
        assertThat(updated.getMembers()).extracting("navIdent").containsExactly(IDENT_TO_KEEP);
    }

    @Test
    void remove_shouldRemoveFromOwnerGroupNavidentList() {
        ProductArea pa = storageService.save(ProductArea.builder()
                .members(new ArrayList<>())
                .ownerGroupNavidentList(new ArrayList<>(List.of(IDENT_TO_REMOVE, IDENT_TO_KEEP)))
                .build());

        nomClient.remove(List.of(FID_TO_REMOVE));

        ProductArea updated = storageService.get(pa.getId(), ProductArea.class);
        assertThat(updated.getOwnerGroupNavidentList()).containsExactly(IDENT_TO_KEEP);
    }

    @Test
    void remove_shouldRemoveResourceFromInMemoryState() {
        assertThat(nomClient.getByNavIdent(IDENT_TO_REMOVE)).isPresent();

        nomClient.remove(List.of(FID_TO_REMOVE));

        assertThat(nomClient.getByNavIdent(IDENT_TO_REMOVE)).isEmpty();
        assertThat(nomClient.getByNavIdent(IDENT_TO_KEEP)).isPresent();
    }

    @Test
    void remove_shouldNotAffectUnrelatedTeams() {
        Team unrelated = storageService.save(Team.builder()
                .members(new ArrayList<>(List.of(
                        TeamMember.builder().navIdent(IDENT_TO_KEEP).build()
                )))
                .build());

        nomClient.remove(List.of(FID_TO_REMOVE));

        Team updated = storageService.get(unrelated.getId(), Team.class);
        assertThat(updated.getMembers()).hasSize(1);
    }

    @Test
    void remove_withUnknownFid_shouldReturnEmpty() {
        var removed = nomClient.remove(List.of("unknown-fid"));

        assertThat(removed).isEmpty();
        assertThat(nomClient.getByNavIdent(IDENT_TO_REMOVE)).isPresent();
    }

    @Test
    void remove_shouldRemoveMultipleResourcesByFid() {
        String fid2 = "fid-keep-1";
        var removed = nomClient.remove(List.of(FID_TO_REMOVE, fid2));

        assertThat(removed).hasSize(2);
        assertThat(nomClient.getByNavIdent(IDENT_TO_REMOVE)).isEmpty();
        assertThat(nomClient.getByNavIdent(IDENT_TO_KEEP)).isEmpty();
    }
}
