package no.nav.data.team.integration.process;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.integration.process.ProcessCatalogController.ProcessPage;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import no.nav.data.team.team.domain.Team;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProcessCatalogIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getProcessForTeam() {
        ResponseEntity<ProcessPage> processes = restTemplate
                .getForEntity("/integration/pcat/process?teamId={teamId}", ProcessPage.class, "c1496785-9359-4041-b506-f68246980dbf");
        assertResponseProcess(processes);
    }

    @Test
    void getProcessForProductArea() {
        GenericStorage gs = new GenericStorage();
        gs.setId(UUID.fromString("c1496785-9359-4041-b506-f68246980dbf"));
        Team team = Team.builder().productAreaId(UUID.fromString("c41f8724-01d5-45ef-92fc-b0ccc8e1fc01")).build();
        gs.setDomainObjectData(team);
        repository.save(gs);
        ResponseEntity<ProcessPage> processes = restTemplate
                .getForEntity("/integration/pcat/process?productAreaId={productAreaId}", ProcessPage.class, "c41f8724-01d5-45ef-92fc-b0ccc8e1fc01");
        assertResponseProcess(processes);
    }

    private void assertResponseProcess(ResponseEntity<ProcessPage> processes) {
        assertThat(processes.getBody()).isNotNull();
        assertThat(processes.getBody().getContent()).contains(ProcessResponse.builder()
                .id("74288ec1-c45d-4b9f-b799-33539981a690")
                .name("process name")
                .purposeCode("PURPOSE_CODE")
                .purposeName("Purpose name")
                .purposeDescription("Purpose description")
                .build());
    }

}