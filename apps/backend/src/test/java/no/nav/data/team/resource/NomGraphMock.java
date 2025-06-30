package no.nav.data.team.resource;

import no.nav.data.common.utils.JsonUtils;
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

    private static final Map<String, String> ledermap = Map.of("no11111", "A123656", "se22222", "A123657");

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
                                                createRessurs("D123456", null, null, null),
                                                createRessurs("D123457", null, "no11111", "11"),
                                                createRessurs("D123458", null, "se22222", "21"),
                                                createRessurs("D123459", "A123658", "dk22222", "31")
                                        )
                                )
                        )
                ))));

        stubOrg("no11111", "11", "ge44444", "12");
        stubOrg("ge44444", "12", "fr555555", "13");
        stubOrg("fr555555", "13", "is66666", "854");
        stubOrg("is66666", "854", "ne77777", "14");
        stubOrg("ne77777", "14", "na_00000", "NAV");

        stubOrg("se22222", "21", "wa99999", "22");
        stubOrg("wa99999", "22", "ir01234", "23");
        stubOrg("ir01234", "23", "sk45678", "24");
        stubOrg("sk45678", "24", "na_00000", "NAV");

        stubOrg("dk22222", "31", null, null);

        stubOrg("na_00000", "NAV", null, null);

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

    private static void stubOrg(String nomId, String agressoId, String parentNomId, String parentAgressoId) {
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getOrgWithOrganiseringer.*%s.*".formatted(nomId)))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", createOrg(nomId, agressoId, parentNomId, parentAgressoId))
                        )
                ))));
    }

    private static RessursWrapper createRessurs(String ident, String leader, String nomId, String agressoId) {
        var ressurs = RessursDto.builder()
                .setNavident(ident)
                .setLedere(leader != null ? List.of(RessursLederDto.builder().setRessurs(RessursDto.builder().setNavident(leader).build()).build()) : List.of())
                .setOrgTilknytning((nomId == null || agressoId == null) ?
                        List.of() :
                        List.of(RessursOrgTilknytningDto.builder().setOrgEnhet(createOrg(nomId, agressoId)).build())
                )
                .build();
        return RessursWrapper.builder()
                .id(ident)
                .ressurs(ressurs)
                .build();
    }

    private static OrgEnhetDto createOrg(String nomId, String agressoId) {
        return createOrg(nomId, agressoId, null, null);
    }

    private static OrgEnhetDto createOrg(String nomId, String agressoId, String parentNomId, String parentAgressoId) {
        var leder = ledermap.get(nomId);
        return OrgEnhetDto.builder()
                .setAgressoId(agressoId)
                .setId(nomId)
                .setNavn(agressoId + " navn")
                .setOrganiseringer((parentNomId == null || parentAgressoId == null) ?
                        List.of() :
                        List.of(OrganiseringDto.builder()
                            .setRetning(RetningDto.over)
                            .setOrgEnhet(OrgEnhetDto.builder()
                                .setAgressoId(parentAgressoId)
                                .setId(parentNomId)
                                .build())
                        .build()))
                .setLeder(leder != null ? List.of(OrgEnhetsLederDto.builder().setRessurs(RessursDto.builder().setNavident(leder).build()).build()) : List.of())
                .build();
    }

}
