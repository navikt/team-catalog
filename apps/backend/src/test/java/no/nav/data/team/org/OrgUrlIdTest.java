package no.nav.data.team.org;

import lombok.val;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class OrgUrlIdTest {

    public void roundTrip(String startUrl, String expectedOrgNiv, String expectedAgressoId) {
        val urldata = new OrgUrlId(startUrl);
        assertThat(urldata).isEqualTo(new OrgUrlId(expectedOrgNiv, expectedAgressoId));

        val endUrl = urldata.asUrlIdStr();
        assertThat(startUrl).isEqualTo(endUrl);
    }

    @Test
    public void roundTrip1() {
        roundTrip("0_NAV", "ORGNIV0", "NAV");
    }

    @Test
    public void roundTrip2() {
        roundTrip("4_NAVet", "ORGNIV4", "NAVet");
    }

    @Test
    public void roundTrip3() {
        roundTrip("NAVeret", "ORGENHET", "NAVeret");
    }

    @Test
    public void roundTrip4() {
        roundTrip("25_NAVet", "ORGNIV25", "NAVet");
    }

    @Test
    public void negativeTests() {
        val failExamples = List.of("533_NVA", "0_3_2", "26_ENHET", "27_test");
        for (val orgUrlId : failExamples) {
            try {
                new OrgUrlId(orgUrlId);
                throw new IllegalStateException("Should throw error");

            } catch (IllegalArgumentException ignored) {
            }
        }
    }
}
