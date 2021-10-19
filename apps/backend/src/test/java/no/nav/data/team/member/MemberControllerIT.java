package no.nav.data.team.member;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.member.dto.MembershipResponse;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.dto.TeamResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class MemberControllerIT extends IntegrationTestBase {


    @Test
    void getMemberships() {
        String navIdent = "S123123";
        var productArea = ProductArea.builder().name("pa name1").members(List.of(PaMember.builder().navIdent(navIdent).build())).build();

        storageService.save(productArea);
        storageService.save(Team.builder().name("name1").members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("name2").members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("name3").build());

        ResponseEntity<MembershipResponse> resp = restTemplate.getForEntity("/member/membership/{ident}", MembershipResponse.class, navIdent);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getTeams().size()).isEqualTo(2L);
        assertThat(convert(resp.getBody().getTeams(), TeamResponse::getName)).contains("name1", "name2");
        assertThat(resp.getBody().getProductAreas().size()).isEqualTo(1L);
        assertThat(convert(resp.getBody().getProductAreas(), ProductAreaResponse::getName)).contains("pa name1");
    }
}