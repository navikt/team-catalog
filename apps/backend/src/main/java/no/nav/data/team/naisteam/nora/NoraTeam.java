package no.nav.data.team.naisteam.nora;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.naisteam.domain.NaisTeam;

import java.util.List;

import static no.nav.data.team.common.utils.StreamUtils.convert;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoraTeam {

    @JsonProperty("_id")
    private String id;
    private String name;
    private String nick;
    private String groupId;
    @JsonProperty("created_at")
    private String createdAt;
    @JsonProperty("updated_at")
    private String updatedAt;
    private List<NoraMember> members;

    public NaisTeam convertToTeam() {
        return NaisTeam.builder()
                .id(nick)
                .name(name)
                .naisMembers(convert(members, NoraMember::convertToMember))
                .build();
    }
}
