package no.nav.data.team.po.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.dto.PaMemberRequest;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.team.domain.TeamRole;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaMember {

    private String navIdent;
    @Singular
    private List<TeamRole> roles;
    private String description;

    public static PaMember convert(PaMemberRequest request) {
        return PaMember.builder()
                .navIdent(request.getNavIdent())
                .roles(request.getRoles())
                .description(request.getDescription())
                .build();
    }

    public MemberResponse convertToResponse() {
        var builder = MemberResponse.builder()
                .navIdent(getNavIdent())
                .roles(copyOf(getRoles()))
                .description(getDescription());

        NomClient.getInstance()
                .getByNavIdent(getNavIdent())
                .ifPresentOrElse(resource ->
                                builder.resource(resource.convertToResponse())
                        , () -> builder.resource(ResourceResponse.builder().navIdent(getNavIdent()).stale(true).build()));
        return builder.build();
    }
}
