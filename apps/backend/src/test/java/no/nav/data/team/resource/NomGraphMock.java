package no.nav.data.team.resource;

import no.nav.data.common.utils.JsonUtils;
import no.nav.data.team.org.OrgUrlId;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiRessurs.DataWrapper.RessursWrapper;
import no.nav.nom.graphql.model.*;

import java.util.List;
import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.matching;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;

/**
 * See ResourceLocationTree.json for more of a full level look
 */
public class NomGraphMock {

    private static final Map<String, String> ledermap = Map.of("1_11", "A123656", "1_21", "A123657");

    /**
     * D123456 - 0 koblinger 0 ledere <br/>
     * D123457 - 11 -> 12 -> 13 (parent) -> 854 -> 14 -> NAV leder: A123656 <br/>
     * D123458 - 21 -> 22 -> 23 (parent) -> 24 -> NAV leder: A123657 <br/>
     * D123459 - 31 (nolead) -> NAV leder: A123658 <br/>
     */
    public static void mock() {
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getOrgForIdents.*"))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("ressurser",
                                        List.of(
                                                createRessurs("D123456", null, null),
                                                createRessurs("D123457", null, "1_11"),
                                                createRessurs("D123458", null, "1_21"),
                                                createRessurs("D123459", "A123658", "1_31")
                                        )
                                )
                        )
                ))));

        stubOrg("1_11", "1_12");
        stubOrg("1_12", "1_13");
        stubOrg("1_13", "2_854");
        stubOrg("2_854", "1_14");
        stubOrg("1_14", "0_NAV");

        stubOrg("1_21", "1_22");
        stubOrg("1_22", "1_23");
        stubOrg("1_23", "1_24");
        stubOrg("1_24", "0_NAV");

        stubOrg("1_31", null);

        stubOrg("0_NAV", null);

        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getRessurserForOrgLeadBy.*"))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("ressurs",
                                        RessursDto.builder()
                                                .setNavident("")
                                                .setLederFor(List.of())
                                                .build()
                                )
                        )
                ))));
    }

    private static void stubOrg(String orgId, String parentId) {
        stubFor(post("/nomgraphql")
                // will only differentiate on the agressoId part of the org id, ignoring orgNiv
                .withRequestBody(matching(".*getOrgWithOrganiseringer.*%s.*".formatted(new OrgUrlId(orgId).getAgressoId())))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", createOrg(new OrgUrlId(orgId), parentId)
                                )
                        )
                ))));
    }

    private static RessursWrapper createRessurs(String ident, String leader, String orgUrlIdStr) {
        var ressurs = RessursDto.builder()
                .setNavident(ident)
                .setLedere(leader != null ? List.of(RessursLederDto.builder().setRessurs(RessursDto.builder().setNavident(leader).build()).build()) : List.of())
                .setOrgTilknytning(orgUrlIdStr != null ? List.of(RessursOrgTilknytningDto.builder().setOrgEnhet(createOrg(new OrgUrlId(orgUrlIdStr))).build()) : List.of())
                .build();
        return RessursWrapper.builder()
                .id(ident)
                .ressurs(ressurs)
                .build();
    }

    private static OrgEnhetDto createOrg(OrgUrlId org) {
        return createOrg(org, null);
    }

    private static OrgEnhetDto createOrg(OrgUrlId org, String parentId) {
        var leder = ledermap.get(org.asUrlIdStr());
        var parentOrgUrlId = parentId != null ? new OrgUrlId(parentId) : null;
        return OrgEnhetDto.builder()
                .setAgressoId(org.getAgressoId())
                .setOrgNiv(org.getOrgNiv())
                .setNavn(org.getAgressoId() + " navn")
                .setOrganiseringer(parentOrgUrlId != null ? List.of(OrganiseringDto.builder()
                        .setRetning(RetningDto.over)
                        .setOrgEnhet(OrgEnhetDto.builder()
                                .setAgressoId(parentOrgUrlId.getAgressoId())
                                .setOrgNiv(parentOrgUrlId.getOrgNiv())
                                .build())
                        .build()) : List.of())
                .setLeder(leder != null ? List.of(OrgEnhetsLederDto.builder().setRessurs(RessursDto.builder().setNavident(leder).build()).build()) : List.of())
                .build();
    }

}
