package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.nom.graphql.model.OrganisasjonsenhetDto;
import no.nav.nom.graphql.model.OrganisasjonsenhetsLederDto;
import no.nav.nom.graphql.model.OrganiseringDto;
import no.nav.nom.graphql.model.RessursDto;
import no.nav.nom.graphql.model.RessursKoblingDto;
import no.nav.nom.graphql.model.RessursLederDto;
import no.nav.nom.graphql.model.RetningDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.distinctByKey;
import static no.nav.data.common.utils.StreamUtils.safeStream;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResourceUnitsResponse {

    private static final String TOP_LEVEL_ID = "NAV";
    private static final String IT_AVD_ID = "854";

    @Singular
    List<Unit> units;
    @Singular
    List<ResourceResponse> members;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Unit {

        String id;
        String name;

        @JsonInclude(Include.NON_EMPTY)
        ResourceResponse leader;
        @JsonInclude(Include.NON_EMPTY)
        Unit parentUnit;
    }

    public static ResourceUnitsResponse from(RessursDto nomRessurs, List<String> memberIdents, Function<String, Optional<OrganisasjonsenhetDto>> hentOrgEnhet) {
        var units = new ArrayList<Unit>();
        nomRessurs.getKoblinger()
                .stream()
                .filter(dto -> DateUtil.isNow(dto.getGyldigFom(), dto.getGyldigTom()))
                .map(RessursKoblingDto::getOrganisasjonsenhet)
                .filter(distinctByKey(OrganisasjonsenhetDto::getAgressoId))
                .forEach(org -> {
                    var unitBuilder = Unit.builder().id(org.getAgressoId()).name(org.getNavn());
                    findParentUnit(org.getAgressoId(), hentOrgEnhet)
                            .ifPresent(parentUnit -> unitBuilder.parentUnit(Unit.builder().id(parentUnit.id()).name(parentUnit.navn()).build()));

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

    private static Optional<UnitId> findParentUnit(String agressoId, Function<String, Optional<OrganisasjonsenhetDto>> hentOrgEnhet) {
        var org = hentOrgEnhet.apply(agressoId).orElseThrow();
        var trace = new ArrayList<OrganisasjonsenhetDto>();
        trace.add(org);

        var parent = firstValid(org.getOrganiseringer(), hentOrgEnhet);
        while (parent != null && !parent.getAgressoId().equals(trace.get(0).getAgressoId()) && !TOP_LEVEL_ID.equals(trace.get(0).getAgressoId())) {
            trace.add(0, parent);
            parent = firstValid(parent.getOrganiseringer(), hentOrgEnhet);
        }
        if (trace.get(0).getAgressoId().equals(TOP_LEVEL_ID)) {
            return Optional.of(switch (trace.size()) {
                case 1 -> new UnitId(trace.get(0));
                case 2 -> new UnitId(trace.get(1));
                default -> {
                    var itAvd = trace.stream().filter(o -> o.getAgressoId().equals(IT_AVD_ID)).findFirst();
                    if (itAvd.isPresent()) {
                        // IT should be level=2, and IT-sub level=3 but we can be safe
                        var itAvdIdx = trace.indexOf(itAvd.get());
                        int itAvdSubIdx = itAvdIdx + 1;
                        if (itAvdSubIdx < trace.size()) {
                            yield new UnitId(trace.get(itAvdSubIdx).getAgressoId(), trace.get(itAvdIdx).getNavn() + " - " + trace.get(itAvdSubIdx).getNavn());
                        }
                    }
                    yield new UnitId(trace.get(2));
                }
            });
        }
        return Optional.empty();
    }

    private static OrganisasjonsenhetDto firstValid(List<OrganiseringDto> organiseringer, Function<String, Optional<OrganisasjonsenhetDto>> hentOrgEnhet) {
        return safeStream(organiseringer)
                .filter(o -> o.getRetning() == RetningDto.over)
                .filter(dto -> DateUtil.isNow(dto.getGyldigFom(), dto.getGyldigTom()))
                .findFirst()
                .map(OrganiseringDto::getOrganisasjonsenhet)
                .map(OrganisasjonsenhetDto::getAgressoId)
                .flatMap(hentOrgEnhet)
                .orElse(null);
    }

    private record UnitId(String id, String navn) {

        private UnitId(OrganisasjonsenhetDto org) {
            this(org.getAgressoId(), org.getNavn());
        }
    }
}
