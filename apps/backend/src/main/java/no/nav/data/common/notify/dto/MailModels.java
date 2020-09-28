package no.nav.data.common.notify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
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
    @AllArgsConstructor
    public static class Item {

        String type;
        String url;
        String name;
        boolean deleted;

        public Item(String url, String name, boolean deleted) {
            this(null, url, name, deleted);
        }

        public Item(String url, String name) {
            this(null, url, name, false);
        }

        public Item(String type, String url, String name) {
            this(type, url, name, false);
        }
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class UpdateItem {

        String type;
        Item item;

        String fromName;
        String toName;
        String fromType;
        String toType;

        String fromProductArea;
        String fromProductAreaUrl;
        String toProductArea;
        String toProductAreaUrl;

        @Default
        List<Item> removedMembers = new ArrayList<>();
        @Default
        List<Item> newMembers= new ArrayList<>();

        @Default
        List<Item> removedTeams= new ArrayList<>();
        @Default
        List<Item> newTeams= new ArrayList<>();

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
                    || !newMembers.isEmpty()
                    || !removedTeams.isEmpty()
                    || !newTeams.isEmpty();
        }
    }

}
