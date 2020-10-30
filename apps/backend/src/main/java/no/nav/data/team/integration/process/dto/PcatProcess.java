package no.nav.data.team.integration.process.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PcatProcess {

    private String id;
    private String name;
    private PcatCode purpose;
    private List<PcatCode> purposes;

    public ProcessResponse convertToResponse() {
        PcatCode usedPurpose = purpose == null ? purposes.get(0) : purpose;
        return ProcessResponse.builder()
                .id(id)
                .name(name)
                .purposeCode(usedPurpose.getCode())
                .purposeName(usedPurpose.getShortName())
                .purposeDescription(usedPurpose.getDescription())
                .build();
    }
}
