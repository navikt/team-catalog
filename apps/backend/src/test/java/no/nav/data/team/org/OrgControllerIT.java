package no.nav.data.team.org;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.resource.NomGraphMock;
import no.nav.nom.graphql.model.OrgEnhetDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OrgControllerIT extends IntegrationTestBase {

    @BeforeEach
    void setUp() {
        NomGraphMock.mock();
    }

    @Test
    void getOrg() {
        var res = assertResponse(restTemplate.getForEntity("/org/11", OrgEnhetDto.class));

        assertThat(res.getAgressoId()).isEqualTo("11");
        assertThat(res.getNavn()).isEqualTo("11 navn");
    }
}