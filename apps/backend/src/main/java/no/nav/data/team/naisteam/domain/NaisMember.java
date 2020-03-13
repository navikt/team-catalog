package no.nav.data.team.naisteam.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.naisteam.dto.NaisMemberResponse;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NaisMember {

    private String name;
    private String email;

    public NaisMemberResponse convertToResponse() {
        return NaisMemberResponse.builder().name(name).email(email).build();
    }
}
