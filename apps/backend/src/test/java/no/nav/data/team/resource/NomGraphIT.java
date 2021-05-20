package no.nav.data.team.resource;

import no.nav.data.common.security.SecurityProperties;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.resource.dto.ResourceUnitsResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static no.nav.data.team.TestDataHelper.createResource;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * See {@link NomGraphMock} for testdata
 */
class NomGraphIT extends IntegrationTestBase {

    @Autowired
    SecurityProperties securityProperties;

    @BeforeEach
    void setUp() {
        // NomGraph is currently disabled in "dev"
        securityProperties.setEnv("test");
        NomGraphMock.mock();
        addNomResources(
                createResource("Fam", "Giv", createNavIdent(200)),
                createResource("Fam", "Giv", createNavIdent(201)),
                createResource("Fam", "Giv", createNavIdent(202)));
    }

    @Test
    void getResourceUnitsForUserWithNoInfo() {
        var res = restTemplate.getForEntity("/resource/D123456/units", ResourceUnitsResponse.class);

        var data = assertResponse(res);
        assertThat(data.getUnits()).isEmpty();

        System.out.println(data);
    }

    @Test
    void getResourceUnitsForUserInIT() {
        var res = restTemplate.getForEntity("/resource/D123457/units", ResourceUnitsResponse.class);

        var data = assertResponse(res);
        assertThat(data.getUnits()).hasSize(1);
        var unit = data.getUnits().get(0);
        assertThat(unit.getId()).isEqualTo("11");
        assertThat(unit.getName()).isEqualTo("11 navn");
        assertThat(unit.getParentUnit().getId()).isEqualTo("13");
        assertThat(unit.getParentUnit().getName()).isEqualTo("854 navn - 13 navn");
        assertThat(unit.getLeader().getNavIdent()).isEqualTo("A123656");

        System.out.println(data);
    }

    @Test
    void getResourceUnitsForUserNotInIT() {
        var res = restTemplate.getForEntity("/resource/D123458/units", ResourceUnitsResponse.class);

        var data = assertResponse(res);
        assertThat(data.getUnits()).hasSize(1);
        var unit = data.getUnits().get(0);
        assertThat(unit.getId()).isEqualTo("21");
        assertThat(unit.getName()).isEqualTo("21 navn");
        assertThat(unit.getParentUnit().getId()).isEqualTo("23");
        assertThat(unit.getParentUnit().getName()).isEqualTo("23 navn");
        assertThat(unit.getLeader().getNavIdent()).isEqualTo("A123657");

        System.out.println(data);
    }

    @Test
    void getResourceLeaderDirectlyFromResource() {
        var res = restTemplate.getForEntity("/resource/D123459/units", ResourceUnitsResponse.class);

        var data = assertResponse(res);
        assertThat(data.getUnits()).hasSize(1);
        var unit = data.getUnits().get(0);
        assertThat(unit.getId()).isEqualTo("31");
        assertThat(unit.getName()).isEqualTo("31 navn");
        assertThat(unit.getParentUnit()).isNull();
        assertThat(unit.getLeader().getNavIdent()).isEqualTo("A123658");

        System.out.println(data);
    }
}