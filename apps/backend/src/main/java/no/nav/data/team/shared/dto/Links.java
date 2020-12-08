package no.nav.data.team.shared.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.team.notify.UrlGenerator;
import no.nav.data.team.resource.domain.Resource;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"ui"})
public class Links {

    private String ui;

    public static Links getFor(DomainObject domainObject) {
        UrlGenerator urlGenerator = UrlGenerator.instance();
        if (domainObject instanceof Resource r) {
            return new Links(urlGenerator.resourceUrl(r.getNavIdent()));
        }
        return new Links(urlGenerator.urlFor(domainObject.getClass(), domainObject.getId()));
    }
}
