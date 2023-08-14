package no.nav.data.team.org;

import lombok.EqualsAndHashCode;
import lombok.Value;
import lombok.val;
import no.nav.nom.graphql.model.OrgEnhetDto;

import java.util.List;

@Value
@EqualsAndHashCode
public class OrgUrlId {
    String orgNiv;
    String agressoId;

    public OrgUrlId(String urlId) {
        val s = urlId.split("_");
        if (s.length == 2) {
            val orgNiv = numberStrToOrgNiv(s[0]);
            this.agressoId = s[1];
            this.orgNiv = orgNiv;
        }
        else if (s.length == 1) {
            this.agressoId = urlId;
            this.orgNiv = "ORGENHET";
        } else {
            throw new IllegalArgumentException(urlId + " is not a correctly formatted org-url");
        }
    }

    public OrgUrlId(OrgEnhetDto orgEnhetDto) {
        if(orgEnhetDto.getOrgNiv() == null) {
            throw new IllegalArgumentException("orgniv cannot be null");
        }
        this.orgNiv = orgEnhetDto.getOrgNiv();
        this.agressoId = orgEnhetDto.getAgressoId();
    }

    public OrgUrlId(String orgNivStr, String agressoId) {
        if (agressoId.isBlank()) {
            throw new IllegalArgumentException("agresso id cannot be blank");
        }

        val prefixOk = orgNivStr.contains("ORGNIV");
        if (prefixOk) {
            val numStr = orgNivStr.substring("ORGNIV".length());
            val orgNivOk = List.of("0", "1", "2", "21", "25", "3", "4").contains(numStr);
            if (orgNivOk) {
                this.orgNiv = orgNivStr;
                this.agressoId = agressoId;
                return;
            }
        }
        if(orgNivStr.equals("ORGENHET")){
            this.orgNiv = orgNivStr;
            this.agressoId = agressoId;
            return;
        }
        throw new IllegalArgumentException(orgNivStr + " is not a valid agresso orgNiv");
    }

    public String asUrlIdStr() {
        if(this.orgNiv.equals("ORGENHET")) return this.agressoId;
        return orgNivToNumberStr(this.getOrgNiv()) + "_" + this.agressoId;
    }

    private String numberStrToOrgNiv(String numStr) {
        if (numStr.isBlank()) return "ORGENHET";
        val allowN = List.of("0", "1", "2", "21", "25", "3", "4").contains(numStr);
        if (allowN) return "ORGNIV" + numStr;
        else throw new IllegalArgumentException(numStr + " cannot be translated to a valid agresso orgNiv");
    }

    private String orgNivToNumberStr(String orgNivStr) {
        if (orgNivStr.equals("ORGENHET")) return "";

        val prefixOk = orgNivStr.contains("ORGNIV");
        if (prefixOk) {
            val numStr = orgNivStr.substring("ORGNIV".length());
            val allowNumStr = List.of("0", "1", "2", "21", "25", "3", "4").contains(numStr);
            if (allowNumStr) return numStr;
        }
        throw new IllegalArgumentException(orgNivStr + " is not a valid agresso orgNiv");
    }

}
