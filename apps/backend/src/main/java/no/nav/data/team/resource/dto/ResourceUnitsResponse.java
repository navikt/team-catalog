package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.org.OrgUrlId;
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

    private static final String TOP_LEVEL_ID = "0_NAV";
    private static final String IT_AVD_ID = "2_854";

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
        String nomid;
        String name;
        String niva;

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
                .filter(distinctByKey(k -> k.getOrgNiv() + "_" + k.getAgressoId()))
                .forEach(org -> {
                    var unitBuilder = Unit.builder()
                            .id(org.getAgressoId())
                            .nomid(org.getId())
                            .name(org.getNavn())
                            .niva(org.getOrgNiv());

                    findParentUnit(org.getAgressoId(), org.getOrgNiv(), hentOrgEnhet)
                            .ifPresent(parentUnit ->
                                    unitBuilder.parentUnit(Unit.builder()
                                            .id(parentUnit.id())
                                            .nomid(parentUnit.nomId())
                                            .name(parentUnit.navn())
                                            .niva(parentUnit.niva).build()));

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

    private static Optional<UnitId> findParentUnit(String agressoId, String orgNiv, Function<String, Optional<OrganisasjonsenhetDto>> hentOrgEnhet) {

        var tmpIdUrl = new OrgUrlId(orgNiv, agressoId).asUrlIdStr();
        var org = hentOrgEnhet.apply(tmpIdUrl).orElseThrow();
        var trace = new ArrayList<OrganisasjonsenhetDto>();
        trace.add(org);

        var parent = firstValid(org.getOrganiseringer(), hentOrgEnhet);
        while (parent != null && !parent.getAgressoId().equals(trace.get(0).getAgressoId()) && !TOP_LEVEL_ID.equals(trace.get(0).getAgressoId())) {
            trace.add(0, parent);
            parent = firstValid(parent.getOrganiseringer(), hentOrgEnhet);
        }
        if (new OrgUrlId(trace.get(0)).asUrlIdStr().equals(TOP_LEVEL_ID)) {
            return Optional.of(switch (trace.size()) {
                case 1 -> new UnitId(trace.get(0));
                case 2 -> new UnitId(trace.get(1));
                default -> {
                    var itAvd = trace.stream().filter(o -> new OrgUrlId(o).asUrlIdStr().equals(IT_AVD_ID)).findFirst();
                    if (itAvd.isPresent()) {
                        // IT should be level=2, and IT-sub level=3 but we can be safe
                        var itAvdIdx = trace.indexOf(itAvd.get());
                        int itAvdSubIdx = itAvdIdx + 1;
                        if (itAvdSubIdx < trace.size()) {
                            yield new UnitId(trace.get(itAvdSubIdx).getAgressoId(), trace.get(itAvdIdx).getNavn() + " - " + trace.get(itAvdSubIdx).getNavn(), trace.get(itAvdSubIdx).getOrgNiv(), trace.get(itAvdSubIdx).getId());
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
                .map(OrgUrlId::new)
                .map(OrgUrlId::asUrlIdStr)
                .flatMap(hentOrgEnhet)
                .orElse(null);
    }

    private record UnitId(String id, String navn, String niva, String nomId) {

        private UnitId(OrganisasjonsenhetDto org) {
            this(org.getAgressoId(), org.getNavn(), org.getOrgNiv(), org.getId());
        }
    }
}
