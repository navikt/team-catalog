package no.nav.data.team.po.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.po.dto.PaMemberRequest;
import no.nav.data.team.po.dto.PaMemberResponse;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.dto.ResourceResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaMember {

    private String navIdent;
    private String description;

    public static PaMember convert(PaMemberRequest request) {
        return PaMember.builder()
                .navIdent(request.getNavIdent())
                .description(request.getDescription())
                .build();
    }

    public PaMemberResponse convertToResponse() {
        var builder = PaMemberResponse.builder()
                .navIdent(getNavIdent())
                .description(getDescription());

        NomClient.getInstance()
                .getByNavIdent(getNavIdent())
                .ifPresentOrElse(resource ->
                                builder.resource(resource.convertToResponse())
                        , () -> builder.resource(ResourceResponse.builder().stale(true).build()));
        return builder.build();
    }
}
