package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.notify.UrlGeneratorTestUtil;
import no.nav.data.team.resource.NomMock;
import no.nav.nom.graphql.model.RessursDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(NomMock.class)
class ResourceUnitsResponseTest {

    private static final TypeReference<Map<String, RessursDto>> MAP_TYPE_REFERENCE = new TypeReference<>() {
    };

    @Test
    void testGetLocations() {
        UrlGeneratorTestUtil.get();
        var data = StreamUtils.readCpFile("ResourceLocationTree.json");

        var items = JsonUtils.toObject(data, MAP_TYPE_REFERENCE);

        var empty = ResourceUnitsResponse.from(items.get("D123453"));
        assertThat(empty.getUnits()).hasSize(0);

        var singleUnits = ResourceUnitsResponse.from(items.get("B123455"));
        assertThat(singleUnits.getUnits()).hasSize(1);
        var single = singleUnits.getUnits().get(0);
        // IT_AVD
        assertThat(single.getId()).isEqualTo("1");
        assertThat(single.getParentUnit().getId()).isEqualTo("3");
        assertThat(single.getLeader().getNavIdent()).isEqualTo("A123556");

        var twoDupesAndATopLevel = ResourceUnitsResponse.from(items.get("C123454"));
        assertThat(twoDupesAndATopLevel.getUnits()).hasSize(2);
        var two = twoDupesAndATopLevel.getUnits().get(0);
        assertThat(two.getId()).isEqualTo("1");
        assertThat(two.getLeader().getNavIdent()).isEqualTo("A123557");
        assertThat(two.getParentUnit().getId()).isEqualTo("4");

        var top = twoDupesAndATopLevel.getUnits().get(1);
        assertThat(top.getId()).isEqualTo("NAV");
        assertThat(top.getParentUnit().getId()).isEqualTo("NAV");
    }
}