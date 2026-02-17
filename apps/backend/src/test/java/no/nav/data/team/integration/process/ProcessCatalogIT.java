package no.nav.data.team.integration.process;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.integration.process.ProcessCatalogController.ProcessPage;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import no.nav.data.team.team.domain.Team;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProcessCatalogIT extends IntegrationTestBase {

    @Test
    void getProcessForTeam() {
        var processes = restTestClient.get().uri("/integration/pcat/process?teamId={teamId}", "c1496785-9359-4041-b506-f68246980dbf")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProcessCatalogController.ProcessPage.class)
                .returnResult()
                .getResponseBody();
        assertResponseProcess(processes);
    }

    @Test
    void getProcessForProductArea() {
        GenericStorage gs = new GenericStorage();
        gs.setId(UUID.fromString("c1496785-9359-4041-b506-f68246980dbf"));
        Team team = Team.builder().productAreaId(UUID.fromString("c41f8724-01d5-45ef-92fc-b0ccc8e1fc01")).build();
        gs.setDomainObjectData(team);
        repository.save(gs);
        var processes = restTestClient.get().uri("/integration/pcat/process?productAreaId={productAreaId}", "c41f8724-01d5-45ef-92fc-b0ccc8e1fc01")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProcessPage.class)
                .returnResult()
                .getResponseBody();
        assertResponseProcess(processes);
    }

    private void assertResponseProcess(ProcessPage processes) {
        assertThat(processes).isNotNull();
        assertThat(processes.getContent()).contains(ProcessResponse.builder()
                .id("74288ec1-c45d-4b9f-b799-33539981a690")
                .name("process name")
                .purposeCode("PURPOSE_CODE")
                .purposeName("Purpose name")
                .purposeDescription("Purpose description")
                .build());
    }

}