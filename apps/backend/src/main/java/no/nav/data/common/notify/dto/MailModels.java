package no.nav.data.common.notify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Value;
import lombok.experimental.UtilityClass;
import no.nav.data.common.notify.domain.Notification.NotificationTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@UtilityClass
public class MailModels {

    @Data
    public static class UpdateModel {

        private NotificationTime time;
        private String baseUrl;

        private final List<Item> created = new ArrayList<>();
        private final List<Item> deleted = new ArrayList<>();
        private final List<UpdateItem> updated = new ArrayList<>();

    }

    @Value
    public static class Item {

        String type;
        String name;
        String url;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class UpdateItem {

        String type;
        String name;
        String url;

        String fromName;
        String toName;
        String fromType;
        String toType;

        String fromProductArea;
        String fromProductAreaUrl;
        String toProductArea;
        String toProductAreaUrl;

        List<MemberUpdate> removedMembers;
        List<MemberUpdate> newMembers;

        public boolean newName() {
            return !fromName.equals(toName);
        }

        public boolean newType() {
            return !Objects.equals(fromType, toType);
        }

        public boolean newProductArea() {
            return !Objects.equals(fromProductArea, toProductArea);
        }

        public boolean hasChanged() {
            return newName()
                    || newType()
                    || newProductArea()
                    || !removedMembers.isEmpty()
                    || !newMembers.isEmpty();
        }
    }

    @Value
    public static class MemberUpdate {

        String url;
        String name;
    }
}
