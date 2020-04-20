package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.common.rest.ChangeStampResponse;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "description", "changeStamp"})
public class ProductAreaResponse {

    private UUID id;
    private String name;
    private String description;
    private ChangeStampResponse changeStamp;

}
