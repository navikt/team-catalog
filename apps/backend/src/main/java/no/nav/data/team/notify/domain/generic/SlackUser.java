package no.nav.data.team.notify.domain.generic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlackUser {

    private String id;
    private String name;
}
