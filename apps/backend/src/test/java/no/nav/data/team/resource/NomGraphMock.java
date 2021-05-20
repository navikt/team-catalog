package no.nav.data.team.resource;

import no.nav.data.common.utils.JsonUtils;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiRessurs.DataWrapper.RessursWrapper;
import no.nav.nom.graphql.model.OrganisasjonsenhetDto;
import no.nav.nom.graphql.model.OrganisasjonsenhetsLederDto;
import no.nav.nom.graphql.model.OrganiseringDto;
import no.nav.nom.graphql.model.RessursDto;
import no.nav.nom.graphql.model.RessursKoblingDto;
import no.nav.nom.graphql.model.RessursLederDto;
import no.nav.nom.graphql.model.RetningDto;

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

    private static final Map<String, String> ledermap = Map.of("11", "A123656", "21", "A123657");

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
                                                createRessurs("D123457", null, "11"),
                                                createRessurs("D123458", null, "21"),
                                                createRessurs("D123459", "A123658", "31")
                                        )
                                )
                        )
                ))));

        stubOrg("11", "12");
        stubOrg("12", "13");
        stubOrg("13", "854");
        stubOrg("854", "14");
        stubOrg("14", "NAV");

        stubOrg("21", "22");
        stubOrg("22", "23");
        stubOrg("23", "24");
        stubOrg("24", "NAV");

        stubOrg("31", null);

        stubOrg("NAV", null);

        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getRessurserForOrgLeadBy.*"))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("ressurs",
                                        RessursDto.builder()
                                                .setNavIdent("")
                                                .setLederFor(List.of())
                                                .build()
                                )
                        )
                ))));
    }

    private static void stubOrg(String orgId, String parentId) {
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getOrgWithOrganiseringer.*%s.*".formatted(orgId)))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("organisasjonsenhet", createOrg(orgId, parentId)
                                )
                        )
                ))));
    }

    private static RessursWrapper createRessurs(String ident, String leader, String org) {
        var ressurs = RessursDto.builder()
                .setNavIdent(ident)
                .setLedere(leader != null ? List.of(RessursLederDto.builder().setRessurs(RessursDto.builder().setNavIdent(leader).build()).build()) : List.of())
                .setKoblinger(org != null ? List.of(RessursKoblingDto.builder().setOrganisasjonsenhet(createOrg(org)).build()) : List.of())
                .build();
        return RessursWrapper.builder()
                .id(ident)
                .ressurs(ressurs)
                .build();
    }

    private static OrganisasjonsenhetDto createOrg(String org) {
        return createOrg(org, null);
    }

    private static OrganisasjonsenhetDto createOrg(String org, String parentId) {
        var leder = ledermap.get(org);
        return OrganisasjonsenhetDto.builder()
                .setAgressoId(org)
                .setNavn(org + " navn")
                .setOrganiseringer(parentId != null ? List.of(OrganiseringDto.builder()
                        .setRetning(RetningDto.over)
                        .setOrganisasjonsenhet(OrganisasjonsenhetDto.builder()
                                .setAgressoId(parentId)
                                .build())
                        .build()) : List.of())
                .setLeder(leder != null ? List.of(OrganisasjonsenhetsLederDto.builder().setRessurs(RessursDto.builder().setNavIdent(leder).build()).build()) : List.of())
                .build();
    }

}
