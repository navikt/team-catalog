package no.nav.data.common.notify.dto;

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

    @Value
    public static class UpdateItem {

        String type;
        String name;
        String url;

        String fromName;
        String toName;
        String fromType;
        String toType;

        List<MemberUpdate> removedMembers;
        List<MemberUpdate> newMembers;

        public boolean hasChanged() {
            return !fromName.equals(toName)
                    || Objects.equals(fromType, toType)
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
