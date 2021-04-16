package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Builder;
import lombok.Singular;
import lombok.Value;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.nom.graphql.model.OrganisasjonsenhetDto;
import no.nav.nom.graphql.model.OrganisasjonsenhetsLederDto;
import no.nav.nom.graphql.model.OrganiseringDto;
import no.nav.nom.graphql.model.RessursDto;
import no.nav.nom.graphql.model.RessursKoblingDto;
import no.nav.nom.graphql.model.RessursLederDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.distinctByKey;
import static no.nav.data.common.utils.StreamUtils.safeStream;

@Value
public class ResourceUnitsResponse {

    private static final String TOP_LEVEL_ID = "NAV";
    private static final String IT_AVD_ID = "854";

    @Singular
    List<Unit> units;
    @Singular
    List<ResourceResponse> members;

    @Value
    @Builder
    public static class Unit {

        String id;
        String name;

        @JsonInclude(Include.NON_EMPTY)
        ResourceResponse leader;
        @JsonInclude(Include.NON_EMPTY)
        Unit parentUnit;
    }

    public static ResourceUnitsResponse from(RessursDto nomRessurs, List<String> memberIdents) {
        var units = new ArrayList<Unit>();
        nomRessurs.getKoblinger()
                .stream()
                .filter(dto -> DateUtil.isNow(dto.getGyldigFom(), dto.getGyldigTom()))
                .map(RessursKoblingDto::getOrganisasjonsenhet)
                .filter(distinctByKey(OrganisasjonsenhetDto::getAgressoId))
                .forEach(org -> {
                    var unitBuilder = Unit.builder().id(org.getAgressoId()).name(org.getNavn());
                    findParentUnit(org).ifPresent(parentUnit -> unitBuilder.parentUnit(Unit.builder().id(parentUnit.getAgressoId()).name(parentUnit.getNavn()).build()));

                    org.getLeder().stream().findFirst()
                            .map(OrganisasjonsenhetsLederDto::getRessurs)
                            .map(RessursDto::getNavIdent)
                            .filter(id -> !id.equals(nomRessurs.getNavIdent()))
                            .or(() -> nomRessurs.getLedere().stream()
                                    .map(RessursLederDto::getRessurs)
                                    .map(RessursDto::getNavIdent)
                                    .findFirst()
                            )
                            .ifPresent(ident -> unitBuilder.leader(NomClient.getInstance()
                                    .getByNavIdent(ident)
                                    .map(Resource::convertToResponse)
                                    .orElse(null))
                            );

                    units.add(unitBuilder.build());
                });
        var members = convert(memberIdents, ident -> NomClient.getInstance().getByNavIdent(ident).map(Resource::convertToResponse).orElse(null));
        return new ResourceUnitsResponse(units, members);
    }

    private static Optional<OrganisasjonsenhetDto> findParentUnit(OrganisasjonsenhetDto org) {
        var trace = new ArrayList<OrganisasjonsenhetDto>();
        trace.add(org);

        var parent = firstValid(org.getOrganiseringer());
        while (parent != null && !parent.getAgressoId().equals(trace.get(0).getAgressoId()) && !TOP_LEVEL_ID.equals(trace.get(0).getAgressoId())) {
            trace.add(0, parent);
            parent = firstValid(parent.getOrganiseringer());
        }
        if (trace.get(0).getAgressoId().equals(TOP_LEVEL_ID)) {
            return Optional.of(switch (trace.size()) {
                case 1 -> trace.get(0);
                case 2 -> trace.get(1);
                default -> {
                    if (trace.size() > 3 && trace.stream().anyMatch(o -> o.getAgressoId().equals(IT_AVD_ID))) {
                        yield trace.get(3);
                    }
                    yield trace.get(2);
                }
            });
        }
        return Optional.empty();
    }

    private static OrganisasjonsenhetDto firstValid(List<OrganiseringDto> organiseringer) {
        return safeStream(organiseringer)
                .filter(dto -> DateUtil.isNow(dto.getGyldigFom(), dto.getGyldigTom()))
                .findFirst()
                .map(OrganiseringDto::getOrganisasjonsenhet)
                .orElse(null);
    }

}
