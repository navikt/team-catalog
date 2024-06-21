package no.nav.data.team.resource.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.dto.Links;
import org.apache.commons.lang3.BooleanUtils;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

import static java.util.Objects.isNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resource implements DomainObject {

    private static final RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
    private static final long MIN_UPTIME_BEFORE_STALE = Duration.ofMinutes(10).toMillis();

    private UUID id;
    private ChangeStamp changeStamp;

    private int resourceHashCode;
    private int partition;
    private long offset;
    private ZonedDateTime readTime;
    @JsonIgnore
    private boolean stale;

    private String navIdent;
    private String givenName;
    private String familyName;
    private String fullName;
    private String email;
    private boolean onLeave;
    private ResourceType resourceType;
    private String originalResourceType;
    private LocalDate startDate;
    private LocalDate endDate;

    public Resource(NomRessurs nomRessurs) {
        cloneFrom(nomRessurs);
    }

    private void cloneFrom(NomRessurs nomRessurs) {
        resourceHashCode = nomRessurs.hashCode();
        partition = nomRessurs.getPartition();
        offset = nomRessurs.getOffset();
        readTime = ZonedDateTime.now();

        navIdent = nomRessurs.getNavident().toUpperCase();
        givenName = nomRessurs.getFornavn();
        familyName = nomRessurs.getEtternavn();
        fullName = nomRessurs.getFullName();
        email = nomRessurs.getEpost();
        onLeave = BooleanUtils.isTrue(nomRessurs.getPermisjon());
        resourceType = ResourceType.fromRessursType(nomRessurs.getRessurstype());
        originalResourceType = resourceType == ResourceType.OTHER ? nomRessurs.getRessurstype() : resourceType.name();
        startDate = nomRessurs.getStartdato();
        endDate = nomRessurs.getSluttdato();
    }

    public Resource stale() {
        stale = runtime.getUptime() > MIN_UPTIME_BEFORE_STALE;
        return this;
    }

    public boolean isInactive() {
        return endDate != null && endDate.isBefore(LocalDate.now().plusDays(1));
    }

    public ResourceResponse convertToResponse() {
        return ResourceResponse.builder()
                .navIdent(navIdent)
                .givenName(givenName)
                .familyName(familyName)
                .fullName(fullName)
                .email(email)
                .onLeave(onLeave)
                .resourceType(resourceType)
                .startDate(startDate)
                .endDate(shouldHideEndDateIfBeforeNow())
                .stale(stale)
                .links(Links.getFor(this))
                .build();
    }

    private LocalDate shouldHideEndDateIfBeforeNow() {
        if (isNull(this.endDate) || this.endDate.isBefore(LocalDate.now())) return null;
        else return this.endDate;
    }
}
