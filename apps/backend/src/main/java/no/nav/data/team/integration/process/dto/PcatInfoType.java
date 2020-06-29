package no.nav.data.team.integration.process.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PcatInfoType {

    private String id;
    private String name;

    public InfoTypeResponse convertToResponse() {
        return InfoTypeResponse.builder()
                .id(id)
                .name(name)
                .build();
    }
}
