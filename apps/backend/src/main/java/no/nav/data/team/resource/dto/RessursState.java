package no.nav.data.team.resource.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record RessursState(

        String personident,
        String navident,
        String sektor,
        Visningsnavn visningsnavn,
        LocalDate startdato,
        LocalDate sluttdato) {

    public record Visningsnavn(
            String fornanvn,
            String mellomnavn,
            String etternavn
    ) {}
}
