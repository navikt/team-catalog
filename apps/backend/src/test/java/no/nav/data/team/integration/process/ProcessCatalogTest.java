package no.nav.data.team.integration.process;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.integration.process.ProcessCatalogController.InfoTypePage;
import no.nav.data.team.integration.process.ProcessCatalogController.ProcessPage;
import no.nav.data.team.integration.process.dto.InfoTypeResponse;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class ProcessCatalogTest extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getProcessForTeam() {
        ResponseEntity<ProcessPage> processes = restTemplate
                .getForEntity("/integration/process?teamId={teamId}", ProcessPage.class, "c1496785-9359-4041-b506-f68246980dbf");
        assertResponseProcess(processes);
    }

    @Test
    void getProcessForProductArea() {
        ResponseEntity<ProcessPage> processes = restTemplate
                .getForEntity("/integration/process?productAreaId={productAreaId}", ProcessPage.class, "c41f8724-01d5-45ef-92fc-b0ccc8e1fc01");
        assertResponseProcess(processes);
    }

    @Test
    void getInfoTypeForTeam() {
        ResponseEntity<InfoTypePage> infoTypes = restTemplate
                .getForEntity("/integration/informationtype?teamId={teamId}", InfoTypePage.class, "c1496785-9359-4041-b506-f68246980dbf");
        assertResponseInfoType(infoTypes);
    }

    @Test
    void getInfoTypeForProductArea() {
        ResponseEntity<InfoTypePage> infoTypes = restTemplate
                .getForEntity("/integration/informationtype?productAreaId={productAreaId}", InfoTypePage.class, "c41f8724-01d5-45ef-92fc-b0ccc8e1fc01");
        assertResponseInfoType(infoTypes);
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

    private void assertResponseInfoType(ResponseEntity<InfoTypePage> infoTypes) {
        assertThat(infoTypes.getBody()).isNotNull();
        assertThat(infoTypes.getBody().getContent()).contains(InfoTypeResponse.builder()
                .id("dd4cef1e-7a8e-44d1-8f92-e08a67188571")
                .name("infotype name")
                .build());
    }
}