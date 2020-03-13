package no.nav.data.team.naisteam.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.naisteam.dto.NaisTeamResponse;

import java.util.List;

import static no.nav.data.team.common.utils.StreamUtils.convert;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NaisTeam {

    private String id;
    private String name;
    private List<NaisMember> naisMembers;

    public NaisTeamResponse convertToResponse() {
        return NaisTeamResponse.builder()
                .id(id)
                .name(name)
                .members(convert(naisMembers, NaisMember::convertToResponse))
                .build();
    }
}
