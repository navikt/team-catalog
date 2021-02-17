package no.nav.data.team.notify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.Value;
import lombok.experimental.UtilityClass;
import no.nav.data.team.notify.TemplateService.MailTemplates;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.dto.MailModels.UpdateModel.TargetType;
import no.nav.data.team.shared.Lang;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static no.nav.data.team.notify.TemplateService.MailTemplates.TEAM_INACTIVE;
import static no.nav.data.team.notify.TemplateService.MailTemplates.TEAM_NUDGE;
import static no.nav.data.team.notify.TemplateService.MailTemplates.TEAM_UPDATE;

@UtilityClass
public class MailModels {

    @Data
    public static class UpdateModel implements Model {

        public enum TargetType {
            TEAM,
            AREA;
        }

        private NotificationTime time;
        private String baseUrl;

        private final List<TypedItem> created = new ArrayList<>();
        private final List<TypedItem> deleted = new ArrayList<>();
        private final List<UpdateItem> updated = new ArrayList<>();

        private final MailTemplates template = TEAM_UPDATE;
    }

    @Value
    @AllArgsConstructor
    public static class Resource {

        String url;
        String name;
        String ident;

    }

    @Value
    @AllArgsConstructor
    public static class TypedItem {

        TargetType type;
        String id;
        String url;
        String name;
        boolean deleted;

        public TypedItem(TargetType type, String id, String url, String name) {
            this.type = type;
            this.id = id;
            this.url = url;
            this.name = name;
            deleted = false;
        }

        public String formatName() {
            return getType() == null ? getName() : "%s: %s".formatted(nameForType(), getName());
        }

        private String nameForType() {
            if (type == TargetType.AREA) {
                return Lang.AREA;
            }
            return Lang.TEAM;
        }

    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class UpdateItem {

        TypedItem item;

        String fromName;
        String toName;
        String fromType;
        String toType;

        TypedItem oldProductArea;
        TypedItem newProductArea;

        @Default
        List<Resource> removedMembers = new ArrayList<>();
        @Default
        List<Resource> newMembers = new ArrayList<>();

        @Default
        List<TypedItem> removedTeams = new ArrayList<>();
        @Default
        List<TypedItem> newTeams = new ArrayList<>();

        public String getFromProductArea() {
            return oldProductArea.getName();
        }

        public String getFromProductAreaUrl() {
            return oldProductArea.getUrl();
        }
        public String getToProductArea() {
            return newProductArea.getName();
        }

        public String getToProductAreaUrl() {
            return newProductArea.getUrl();
        }

        public boolean newName() {
            return !fromName.equals(toName);
        }

        public boolean newType() {
            return !Objects.equals(fromType, toType);
        }

        public boolean newProductArea() {
            return !Objects.equals(oldProductArea, newProductArea);
        }

        public boolean hasChanged() {
            return newName()
                    || newType()
                    || newProductArea()
                    || !removedMembers.isEmpty()
                    || !newMembers.isEmpty()
                    || !removedTeams.isEmpty()
                    || !newTeams.isEmpty();
        }
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class NudgeModel implements Model {

        private final String targetType;
        private final String targetName;
        private final String targetUrl;

        private final String recipientRole;
        private final String cutoffTime;

        @Default
        private final MailTemplates template = TEAM_NUDGE;

        public String getTargetType() {
            return StringUtils.startsWithIgnoreCase(targetName, targetType) ? "" : targetType;
        }
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class InactiveModel implements Model {

        private final String targetType;
        private final String targetName;
        private final String targetUrl;

        private final String recipientRole;
        private final List<Resource> members;

        @Default
        private final MailTemplates template = TEAM_INACTIVE;

        public String getTargetType() {
            return StringUtils.startsWithIgnoreCase(targetName, targetType) ? "" : targetType;
        }
    }

}
