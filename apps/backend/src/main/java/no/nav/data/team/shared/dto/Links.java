package no.nav.data.team.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.notify.UrlGenerator;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.team.domain.Team;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"ui", "slackChannels"})
public class Links {

    private String ui;
    @JsonInclude(Include.NON_NULL)
    private List<NamedLink> slackChannels;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonPropertyOrder({"name", "url"})
    public static class NamedLink {

        private String name;
        private String url;
    }

    public static Links getFor(DomainObject domainObject) {
        UrlGenerator urlGenerator = UrlGenerator.instance();
        if (domainObject instanceof Resource r) {
            return Links.builder().ui(urlGenerator.resourceUrl(r.getNavIdent())).build();
        }
        return Links.builder()
                .ui(urlGenerator.urlFor(domainObject.getClass(), domainObject.getId()))
                .slackChannels(slackUrls(domainObject))
                .build();
    }

    private static List<NamedLink> slackUrls(DomainObject domainObject) {
        String slack = null;
        if (domainObject instanceof Team t) {
            slack = t.getSlackChannel();
        } else if (domainObject instanceof ProductArea pa) {
            slack = pa.getSlackChannel();
        } else if (domainObject instanceof Cluster c) {
            slack = c.getSlackChannel();
        }
        if (slack == null) {
            return null;
        }
        return UrlGenerator.instance().slackUrls(slack);
    }
}
