package no.nav.data.team;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.integration.process.dto.PcatCode;
import no.nav.data.team.integration.process.dto.PcatInfoType;
import no.nav.data.team.integration.process.dto.PcatProcess;
import no.nav.data.team.naisteam.nora.NoraApp;
import no.nav.data.team.naisteam.nora.NoraMember;
import no.nav.data.team.naisteam.nora.NoraTeam;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.Extension;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.notFound;
import static com.github.tomakehurst.wiremock.client.WireMock.ok;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.put;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;
import static no.nav.data.common.utils.JsonUtils.toJson;

public class WiremockExtension implements Extension, BeforeAllCallback, BeforeEachCallback, AfterEachCallback {

    private static final WireMockServer WIREMOCK = new WireMockServer(
            WireMockConfiguration.wireMockConfig()
                    .dynamicPort()
    );

    @Override
    public void beforeAll(ExtensionContext context) {
        getWiremock().start();
        WireMock.configureFor("localhost", getWiremock().port());
    }

    @Override
    public void beforeEach(ExtensionContext context) {
        stubCommon();
    }

    @Override
    public void afterEach(ExtensionContext context) {
        getWiremock().resetMappings();
    }

    private void stubCommon() {
        getWiremock().stubFor(get("/nora/teams").willReturn(okJson(toJson(noraMockResponse()))));
        getWiremock().stubFor(get("/nora/teams/nais-team-1").willReturn(okJson(toJson(noraTeam("nais-team-1")))));
        getWiremock().stubFor(get("/nora/teams/nais-team-2").willReturn(okJson(toJson(noraTeam("nais-team-2")))));
        getWiremock().stubFor(get("/nora/apps/nais-team-1").willReturn(okJson(toJson(List.of(noraApp("app1"), noraApp("app2"))))));
        getWiremock().stubFor(get("/nora/apps/nais-team-2").willReturn(okJson(toJson(List.of(noraApp("app3"))))));

        getWiremock().stubFor(get(urlMatching("/datacatgraph/node/out/.*")).willReturn(notFound()));
        getWiremock().stubFor(get(urlMatching("/datacatgraph/node/in/.*")).willReturn(notFound()));
        getWiremock().stubFor(put("/datacatgraph/node").willReturn(ok()));
        getWiremock().stubFor(put("/datacatgraph/edge").willReturn(ok()));
        mockBkat();
    }

    static WireMockServer getWiremock() {
        return WIREMOCK;
    }

    private List<NoraTeam> noraMockResponse() {
        return List.of(noraTeam("nais-team-1"), noraTeam("nais-team-2"), NoraTeam.builder().name("xteamR").build());
    }

    private NoraTeam noraTeam(String teamname) {
        return NoraTeam.builder().name(teamname).members(List.of(NoraMember.builder().name("Member Name").email("member@email.com").build())).build();
    }

    private NoraApp noraApp(String appnName) {
        return NoraApp.builder().name("Visual " + appnName).zone("fss").build();
    }

    private void mockBkat() {
        getWiremock().stubFor(get("/processcat/process?productTeam=c1496785-9359-4041-b506-f68246980dbf&pageSize=250&pageNumber=0").willReturn(okJson(toJson(createProcess()))));

        getWiremock().stubFor(
                get("/processcat/informationtype?productTeam=c1496785-9359-4041-b506-f68246980dbf&pageSize=250&pageNumber=0").willReturn(okJson(toJson(createInfoType()))));
        getWiremock().stubFor(
                get("/processcat/informationtype?productArea=c41f8724-01d5-45ef-92fc-b0ccc8e1fc01&pageSize=250&pageNumber=0").willReturn(okJson(toJson(createInfoType()))));
    }

    private RestResponsePage<PcatProcess> createProcess() {
        return new RestResponsePage<>(List.of(PcatProcess.builder()
                .id("74288ec1-c45d-4b9f-b799-33539981a690")
                .name("process name")
                .purpose(PcatCode.builder()
                        .list("PURPOSE")
                        .code("PURPOSE_CODE")
                        .shortName("Purpose name")
                        .description("Purpose description")
                        .build())
                .build()));
    }

    private RestResponsePage<PcatInfoType> createInfoType() {
        return new RestResponsePage<>(List.of(PcatInfoType.builder()
                .id("dd4cef1e-7a8e-44d1-8f92-e08a67188571")
                .name("infotype name")
                .build()));
    }
}
