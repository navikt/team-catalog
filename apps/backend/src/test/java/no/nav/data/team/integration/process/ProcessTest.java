package no.nav.data.team.integration.process;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.integration.process.ProcessController.ProcessPage;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class ProcessTest extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getProcessForTeam() {
        ResponseEntity<ProcessPage> processes = restTemplate.getForEntity("/integration/process?teamId={teamId}", ProcessPage.class, "c1496785-9359-4041-b506-f68246980dbf");
        assertResponse(processes);
    }

    @Test
    void getProcessForProductArea() {
        ResponseEntity<ProcessPage> processes = restTemplate.getForEntity("/integration/process?productAreaId={productAreaId}", ProcessPage.class, "c41f8724-01d5-45ef-92fc-b0ccc8e1fc01");
        assertResponse(processes);
    }

    private void assertResponse(ResponseEntity<ProcessPage> processes) {
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