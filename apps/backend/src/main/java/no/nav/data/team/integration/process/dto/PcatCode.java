package no.nav.data.team.integration.process.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PcatCode {

    private String list;
    private String code;
    private String shortName;
    private String description;
}
