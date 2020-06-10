package no.nav.data.team.naisteam.nora;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.naisteam.domain.NaisMember;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoraMember {

    @JsonProperty("_id")
    private String id;
    private boolean admin;
    private String azureId;
    private String name;
    private String email;

    public NaisMember convertToMember() {
        return NaisMember.builder().name(name).email(email).build();
    }
}
