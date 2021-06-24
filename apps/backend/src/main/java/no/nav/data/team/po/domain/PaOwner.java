package no.nav.data.team.po.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.dto.PaMemberRequest;
import no.nav.data.team.po.dto.PaOwnerRequest;
import no.nav.data.team.po.dto.PaOwnerResponse;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.dto.ResourceResponse;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaOwner {

    private String navIdent;
    @Singular
    private List<OwnerRole> roles;
    private String description;

    public static PaOwner convert(PaOwnerRequest request) {
        return PaOwner.builder()
                .navIdent(request.getNavIdent())
                .roles(request.getRoles())
                .description(request.getDescription())
                .build();
    }

    public PaOwnerResponse convertToResponse() {
        var builder = PaOwnerResponse.builder()
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
