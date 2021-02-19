package no.nav.data.team.notify.slack;

import no.nav.data.common.security.SecurityProperties;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.dto.MailModels.Resource;
import no.nav.data.team.notify.dto.MailModels.TypedItem;
import no.nav.data.team.notify.dto.MailModels.UpdateItem;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
import no.nav.data.team.notify.slack.dto.SlackDtos.PostMessageRequest.Block;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SlackMessageConverter {

    private final SlackClient slackClient;
    private final boolean dev;

    public SlackMessageConverter(SlackClient slackClient, SecurityProperties securityProperties) {
        this.slackClient = slackClient;
        dev = securityProperties.isDev();
    }

    public List<Block> convertTeamUpdateModel(UpdateModel model) {
        var blocks = new ArrayList<Block>();
        blocks.add(Block.header("Oppdateringer i Teamkatalogen %s %s".formatted(timeHeader(model.getTime()), devText())));
        blocks.add(Block.divider());

        if (!model.getCreated().isEmpty()) {
            var text = new StringBuilder("*Opprettet*\n");
            for (TypedItem item : model.getCreated()) {
                text.append(" - ").append(typedItemLink(item));
            }
            blocks.add(Block.text(text.toString()));
            blocks.add(Block.divider());
        }

        if (!model.getDeleted().isEmpty()) {
            var text = new StringBuilder("*Slettet*\n");
            for (TypedItem item : model.getDeleted()) {
                text.append(" - ").append(typedItemLink(item));
            }
            blocks.add(Block.text(text.toString()));
            blocks.add(Block.divider());
        }

        if (!model.getUpdated().isEmpty()) {
            blocks.add(Block.text("*Endret*"));
            for (UpdateItem updateItem : model.getUpdated()) {
                var text = new StringBuilder(" - ").append(typedItemLink(updateItem.getItem()));
                updateContent(text, updateItem);
                blocks.add(Block.text(text.toString()));
            }
            blocks.add(Block.divider());
        }

        blocks.add(Block.text(
                "<%s?source=slackupdate|Teamkatalogen> - varsel kan endres på <%s/user/notifications?source=slackupdate|Mine varsler> mvh <#CG2S8D25D|Datajegerne>"
                        .formatted(model.getBaseUrl(), model.getBaseUrl())));
        return blocks;
    }

    private void updateContent(StringBuilder text, UpdateItem item) {
        if (item.newName()) {
            text.append("   - Navn endret fra: _%s_ til: _%s_\n".formatted(item.getFromName(), item.getToName()));
        }
        if (item.newType()) {
            String fromType = StringUtils.isBlank(item.getFromType()) ? "ingen" : item.getFromType();
            text.append("   - Type endret fra: _%s_ til: _%s_\n".formatted(fromType, item.getToType()));
        }
        newProductArea(text, item);
        membersChanged(text, item);
        teamsChanged(text, item);
    }

    private void newProductArea(StringBuilder text, UpdateItem updated) {
        if (updated.newProductArea()) {
            text.append("   - Område endret fra: ");
            if (updated.getOldProductArea() == null) {
                text.append("_ingen_");
            } else {
                text.append("_<%s?source=slackupdate|%s>_".formatted(updated.getFromProductAreaUrl(), updated.getFromProductArea()));
            }
            text.append(" til: ");
            if (updated.getNewProductArea() == null) {
                text.append("_ingen_");
            } else {
                text.append("_<%s?source=slackupdate|%s>_".formatted(updated.getToProductAreaUrl(), updated.getToProductArea()));
            }
            text.append('\n');
        }
    }

    private void teamsChanged(StringBuilder text, UpdateItem item) {
        if (!item.getNewTeams().isEmpty()) {
            text.append("   - Nytt team\n");
            for (var team : item.getNewTeams()) {
                text.append("     - ").append(typedItemLink(team));
            }
        }
        if (!item.getRemovedTeams().isEmpty()) {
            text.append("   - Fjernet team\n");
            for (var team : item.getRemovedTeams()) {
                text.append("     - ").append(typedItemLink(team));
            }
        }
    }

    private void membersChanged(StringBuilder text, UpdateItem item) {
        if (!item.getNewMembers().isEmpty()) {
            text.append("   - Nytt medlem\n");
            for (Resource member : item.getNewMembers()) {
                text.append("     - ").append(formatMember(member));
            }
        }
        if (!item.getRemovedMembers().isEmpty()) {
            text.append("   - Fjernet medlem\n");
            for (Resource member : item.getRemovedMembers()) {
                text.append("     - ").append(formatMember(member));
            }
        }
    }

    private String formatMember(Resource member) {
        String user = "<%s?source=slackupdate|%s>".formatted(member.getUrl(), member.getName());
        var slackUser = slackClient.getUserByIdent(member.getIdent());
        if (slackUser != null) {
            return user + " - <@%s>\n".formatted(slackUser.getId());
        } else {
            return user + "\n";
        }
    }

    private String typedItemLink(TypedItem item) {
        if (item.isDeleted()) {
            return item.formatName() + "\n";
        }
        return "<%s?source=slackupdate|%s>\n".formatted(item.getUrl(), item.formatName());
    }

    private String devText() {
        return dev ? "[DEV]" : "";
    }

    private String timeHeader(NotificationTime time) {
        return switch (time) {
            case ALL -> "";
            case DAILY -> "siste dag";
            case WEEKLY -> "siste uke";
            case MONTHLY -> "siste måned";
        };
    }

}
