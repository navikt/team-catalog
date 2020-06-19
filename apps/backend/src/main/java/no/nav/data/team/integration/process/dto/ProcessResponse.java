package no.nav.data.team.integration.process.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProcessResponse {

    private String id;
    private String name;

    private String purposeCode;
    private String purposeName;
    private String purposeDescription;
}
