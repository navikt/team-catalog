package no.nav.data.team.contact.domain;

import lombok.Value;
import no.nav.data.team.contact.domain.ContactMessage.Paragraph.VarselUrl;
import no.nav.data.team.integration.slack.dto.SlackDtos.PostMessageRequest.Block;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.team.contact.domain.ContactMessage.Paragraph.VarselUrl.url;

@Value
public class ContactMessage {

    String title;
    String sourceName;
    List<Paragraph> paragraphs = new ArrayList<>();

    public ContactMessage paragraph(String val) {
        paragraphs.add(new Paragraph(val, sourceName, List.of()));
        return this;
    }

    public ContactMessage paragraph(String val, VarselUrl... urls) {
        paragraphs.add(new Paragraph(val, sourceName, Arrays.asList(urls)));
        return this;
    }

    public ContactMessage footer(String baseUrl) {
        return paragraph("")
                .paragraph("%s - , mvh %s", url(baseUrl, "Teamkatalog"), url("slack://channel?team=T5LNAMWNA&id=CG2S8D25D", "Datajegerne"));
    }

    @Value
    public static class Paragraph {

        String val;
        String sourceName;
        List<VarselUrl> urls;

        private String toSlack() {
            var urlsFormatted = convert(urls, u -> "<%s%s|%s>".formatted(u.url, source(u), u.name));
            return val.formatted(urlsFormatted.toArray());
        }

        private String toHtml() {
            var urlsFormatted = convert(urls, u -> "<a href=\"%s%s\">%s</a>".formatted(u.url, source(u), u.name));
            return val.formatted(urlsFormatted.toArray());
        }

        private String source(VarselUrl u) {
            return (u.url.contains("?") ? "&" : "?") + "source=" + sourceName;
        }

        @Value
        public static class VarselUrl {

            String url;
            String name;

            public static VarselUrl url(String url, String name) {
                return new VarselUrl(url, name);
            }
        }

    }

    public List<Block> toSlack() {
        var blocks = new ArrayList<Block>();
        blocks.add(Block.header(title));

        paragraphs.forEach(p -> blocks.add(Block.text(p.toSlack())));

        return blocks;
    }

    public String toHtml() {
        return "<h1>%s</h1>".formatted(title) +
                String.join("\n", convert(paragraphs, p -> "<p>%s</p>".formatted(p.toHtml())));
    }

}
