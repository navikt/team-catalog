package no.nav.data.team.integration.process.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PcatProcess {

    private String id;
    private String name;
    private PcatCode purpose;

    public ProcessResponse convertToResponse() {
        return ProcessResponse.builder()
                .id(id)
                .name(name)
                .purposeCode(purpose.getCode())
                .purposeName(purpose.getShortName())
                .purposeDescription(purpose.getDescription())
                .build();
    }
}
