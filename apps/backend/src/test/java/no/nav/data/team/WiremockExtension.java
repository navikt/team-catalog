package no.nav.data.team;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.integration.process.dto.PcatCode;
import no.nav.data.team.integration.process.dto.PcatProcess;
import no.nav.data.team.naisteam.console.ConsoleTeam;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.Extension;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.util.List;
import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.notFound;
import static com.github.tomakehurst.wiremock.client.WireMock.ok;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.put;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;
import static java.util.Collections.emptyList;
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
        getWiremock().stubFor(post("/console/query").willReturn(okJson(toJson(consoleMockResponse())))); // Stub Nais Console Team Query

        getWiremock().stubFor(get(urlMatching("/datacatgraph/node/out/.*")).willReturn(notFound()));
        getWiremock().stubFor(get(urlMatching("/datacatgraph/node/in/.*")).willReturn(notFound()));
        getWiremock().stubFor(put("/datacatgraph/node").willReturn(ok()));
        getWiremock().stubFor(put("/datacatgraph/edge").willReturn(ok()));
        mockBkat();
    }

    static WireMockServer getWiremock() {
        return WIREMOCK;
    }

    private Map<String, Object> consoleMockResponse() {
        // TODO: Improve graphql response.
        // This is a very rudimentary response made to only fulfill the expectations of the tests from NaisTeamIT
        return Map.of(
                "data", Map.of(
                        "teams", List.of(consoleTeam("nais-team-1"), consoleTeam("nais-team-2"), consoleTeam("xteamR")),
                        "team", consoleTeam("nais-team-1")
                ),
                "errors", emptyList()
        );
//        return List.of(consoleTeam("nais-team-1"), consoleTeam("nais-team-2"), consoleTeam("xteamR"));
    }

    private ConsoleTeam consoleTeam(String teamname) {
        return new ConsoleTeam("", "", teamname);
    }

    private void mockBkat() {
        getWiremock().stubFor(get("/processcat/process?productTeam=c1496785-9359-4041-b506-f68246980dbf&pageSize=250&pageNumber=0").willReturn(okJson(toJson(createProcess()))));
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

}
