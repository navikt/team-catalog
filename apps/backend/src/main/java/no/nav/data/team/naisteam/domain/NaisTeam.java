package no.nav.data.team.naisteam.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.naisteam.dto.NaisTeamResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NaisTeam {

    private String id;
    private String name;
    private String description;
    private String slack;
    private List<NaisMember> naisMembers;
    private List<NaisApp> naisApps;

    public NaisTeamResponse convertToResponse() {
        return NaisTeamResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .slack(slack)
                .members(convert(naisMembers, NaisMember::convertToResponse))
                .apps(convert(naisApps, NaisApp::convertToResponse))
                .build();
    }
}
