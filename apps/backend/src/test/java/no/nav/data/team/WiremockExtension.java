package no.nav.data.team;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import no.nav.data.team.common.utils.JsonUtils;
import no.nav.data.team.naisteam.nora.NoraMember;
import no.nav.data.team.naisteam.nora.NoraTeam;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.Extension;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;

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
        getWiremock().stubFor(get("/nora/teams").willReturn(okJson(JsonUtils.toJson(noraMockResponse()))));
        getWiremock().stubFor(get("/nora/teams/nais-team-1").willReturn(okJson(JsonUtils.toJson(noraTeam("nais-team-1")))));
        getWiremock().stubFor(get("/nora/teams/nais-team-2").willReturn(okJson(JsonUtils.toJson(noraTeam("nais-team-2")))));
    }

    static WireMockServer getWiremock() {
        return WIREMOCK;
    }

    private List<NoraTeam> noraMockResponse() {
        return List.of(noraTeam("nais-team-1"), noraTeam("nais-team-2"), NoraTeam.builder().name("X Team").nick("xteamR").build());
    }

    private NoraTeam noraTeam(String teamname) {
        return NoraTeam.builder().name("Visual " + teamname).nick(teamname).members(List.of(NoraMember.builder().name("Member Name").email("member@email.com").build())).build();
    }
}
