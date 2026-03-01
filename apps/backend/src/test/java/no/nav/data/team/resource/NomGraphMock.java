package no.nav.data.team.resource;

import no.nav.data.common.utils.JsonUtils;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiRessurs.DataWrapper.RessursWrapper;
import no.nav.nom.graphql.model.*;

import java.util.List;
import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

/**
 * See ResourceLocationTree.json for more of a full level look
 */
public class NomGraphMock {

    private static final Map<String, String> ledermap = Map.of("no11111", "A900200", "se22222", "A900201", "ab123c", "S123456");

    /**
     * D123456 - 0 koblinger 0 ledere <br/>
     * D923457 - 11 -> 12 -> 13 (parent) -> 854 -> 14 -> NAV leder: A900200 <br/>
     * D823458 - 21 -> 22 -> 23 (parent) -> 24 -> NAV leder: A900201 <br/>
     * D923459 - 31 (nolead) -> NAV leder: A900202 <br/>
     */
    public static void mock() {
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getOrgForIdents.*"))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("ressurser",
                                        List.of(
                                                createRessurs("D123456", null, null, null),
                                                createRessurs("D923457", null, "no11111", "11"),
                                                createRessurs("D823458", null, "se22222", "21"),
                                                createRessurs("D923459", "A900202", "dk22222", "31"),
                                                createRessurs("S123456", null, "ab123c", "20")
                                        )
                                )
                        )
                ))));

        stubOrg("no11111", "11", "ge44444", "12", RetningDto.over);
        stubOrg("ge44444", "12", "fr555555", "13", RetningDto.over);
        stubOrg("fr555555", "13", "is66666", "854", RetningDto.over);
        stubOrg("is66666", "854", "ne77777", "14", RetningDto.over);
        stubOrg("ne77777", "14", "na_00000", "NAV", RetningDto.over);

        stubOrg("se22222", "21", "wa99999", "22", RetningDto.over);
        stubOrg("wa99999", "22", "ir01234", "23", RetningDto.over);
        stubOrg("ir01234", "23", "sk45678", "24", RetningDto.over);
        stubOrg("sk45678", "24", "na_00000", "NAV", RetningDto.over);

        stubOrg("ab123c", "20", null, null, RetningDto.over);
        stubOrg("de456f", "282", "ab123c", "20", RetningDto.under);
        stubOrg("gh789i", "2820", "de456f", "20", RetningDto.under);
        stubOrg("jk123l", "2821", "de456f", "20", RetningDto.under);
        stubOrg("mn456o", "2822", "de456f", "20", RetningDto.under);
        stubOrg("pq789r", "2823", "de456f", "20", RetningDto.under);

        stubOrg("dk22222", "31", null, null, RetningDto.over);

        stubOrg("na_00000", "NAV", null, null, RetningDto.over);

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

        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getOrgByLeaderNavident.*%s.*".formatted("S123456")))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("ressurs",
                                        Map.of("navident", "S123456",
                                                "lederFor", List.of(LederOrgEnhetDto.builder()
                                                        .setOrgEnhet(OrgEnhetDto.builder().setId("ab123c")
                                                                .build())
                                                        .build()))
                                ))))));

        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getUnderOrganiseringerIds.*%s.*".formatted("ab123c")))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", OrgEnhetDto.builder()
                                        .setOrganiseringer(List.of(
                                                OrganiseringDto.builder()
                                                        .setOrgEnhet(
                                                                OrgEnhetDto.builder()
                                                                        .setId("de456f")
                                                                        .build())
                                                        .build()))
                                        .build()
                                )
                        )
                )))
        );

        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getUnderOrganiseringerIds.*%s.*".formatted("de456f")))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", OrgEnhetDto.builder()
                                        .setOrganiseringer(List.of(
                                                OrganiseringDto.builder()
                                                        .setOrgEnhet(
                                                                OrgEnhetDto.builder()
                                                                        .setId("gh789i")
                                                                        .build())
                                                        .build(),
                                                OrganiseringDto.builder()
                                                        .setOrgEnhet(
                                                                OrgEnhetDto.builder()
                                                                        .setId("jk123l")
                                                                        .build())
                                                        .build(),
                                                OrganiseringDto.builder()
                                                        .setOrgEnhet(
                                                                OrgEnhetDto.builder()
                                                                        .setId("mn456o")
                                                                        .build())
                                                        .build(),
                                                OrganiseringDto.builder()
                                                        .setOrgEnhet(
                                                                OrgEnhetDto.builder()
                                                                        .setId("pq789r")
                                                                        .build())
                                                        .build()))
                                        .build()
                                )
                        )
                )))
        );

        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getUnderOrganiseringerIds.*%s.*".formatted("gh789i")))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", OrgEnhetDto.builder()
                                        .setOrganiseringer(List.of()).build()
                                )
                        )
                )))
        );
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getUnderOrganiseringerIds.*%s.*".formatted("jk123l")))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", OrgEnhetDto.builder()
                                        .setOrganiseringer(List.of()).build()
                                )
                        )
                )))
        );
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getUnderOrganiseringerIds.*%s.*".formatted("mn456o")))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", OrgEnhetDto.builder()
                                        .setOrganiseringer(List.of()).build()
                                )
                        )
                )))
        );
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getUnderOrganiseringerIds.*%s.*".formatted("pq789r")))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", OrgEnhetDto.builder()
                                        .setOrganiseringer(List.of()).build()
                                )
                        )
                )))
        );
    }

    private static void stubOrg(String nomId, String agressoId, String parentNomId, String parentAgressoId, RetningDto retningDto) {
        stubFor(post("/nomgraphql")
                .withRequestBody(matching(".*getOrgWithOrganiseringer.*%s.*".formatted(nomId)))
                .willReturn(okJson(JsonUtils.toJson(
                        Map.of("data",
                                Map.of("orgEnhet", createOrg(nomId, agressoId, parentNomId, parentAgressoId, retningDto))
                        )
                ))));
    }

    private static RessursWrapper createRessurs(String ident, String leader, String nomId, String agressoId) {
        var ressurs = RessursDto.builder()
                .setNavident(ident)
                .setLedere(leader != null ? List.of(RessursLederDto.builder().setRessurs(RessursDto.builder().setNavident(leader).build()).build()) : List.of())
                .setOrgTilknytning((nomId == null || agressoId == null) ?
                        List.of() :
                        List.of(RessursOrgTilknytningDto.builder().setOrgEnhet(createOrg(nomId, agressoId, RetningDto.over)).build())
                )
                .build();
        return RessursWrapper.builder()
                .id(ident)
                .ressurs(ressurs)
                .build();
    }

    private static OrgEnhetDto createOrg(String nomId, String agressoId, RetningDto retingDto) {
        return createOrg(nomId, agressoId, null, null, retingDto);
    }

    private static OrgEnhetDto createOrg(String nomId, String agressoId, String parentNomId, String parentAgressoId, RetningDto retingDto) {
        var leder = ledermap.get(nomId);
        return OrgEnhetDto.builder()
                .setAgressoId(agressoId)
                .setId(nomId)
                .setNavn(agressoId + " navn")
                .setOrganiseringer((parentNomId == null || parentAgressoId == null) ?
                        List.of() :
                        List.of(OrganiseringDto.builder()
                                .setRetning(retingDto)
                                .setOrgEnhet(OrgEnhetDto.builder()
                                        .setAgressoId(parentAgressoId)
                                        .setId(parentNomId)
                                        .build())
                                .build()))
                .setLeder(leder != null ? List.of(OrgEnhetsLederDto.builder().setRessurs(RessursDto.builder().setNavident(leder).build()).build()) : List.of())
                .build();
    }
}
