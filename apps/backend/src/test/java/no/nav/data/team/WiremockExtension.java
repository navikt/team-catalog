package no.nav.data.team;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
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
import static no.nav.data.team.common.utils.JsonUtils.toJson;

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
}
