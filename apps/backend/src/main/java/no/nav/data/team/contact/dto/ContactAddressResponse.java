package no.nav.data.team.contact.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.contact.domain.AdresseType;
import no.nav.data.team.contact.domain.SlackChannel;
import no.nav.data.team.contact.domain.SlackUser;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactAddressResponse {

    private String adresse;
    private AdresseType type;

    private SlackChannel slackChannel;
    private SlackUser slackUser;
}
