package no.nav.data.team.notify.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.notify.dto.MailModels.TypedItem;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;

import java.util.ArrayList;
import java.util.List;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_EMPTY;
import static no.nav.data.common.utils.StreamUtils.convert;

@Data
public class Changelog {

    private final List<Item> created = new ArrayList<>();
    private final List<Item> deleted = new ArrayList<>();
    private final List<Changeable> updated = new ArrayList<>();

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Item {

        TargetType type;

        String id;
        String name;
        @JsonInclude(NON_EMPTY)
        Boolean deleted;

    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static final class UpdateTeam implements Changeable {

        Item target;

        String oldName;
        String newName;
        String oldType;
        String newType;

        Item oldArea;
        Item newArea;

        @Default
        List<Resource> removedMembers = new ArrayList<>();
        @Default
        List<Resource> newMembers = new ArrayList<>();
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static final class UpdateArea implements Changeable {

        Item target;

        String oldName;
        String newName;
        String oldType;
        String newType;

        @Default
        List<Resource> removedMembers = new ArrayList<>();
        @Default
        List<Resource> newMembers = new ArrayList<>();
        @Default
        List<Item> removedTeams = new ArrayList<>();
        @Default
        List<Item> newTeams = new ArrayList<>();
    }

    @JsonAutoDetect(fieldVisibility = Visibility.ANY)
    public static record Resource(String ident, String name) {

    }

    public static Changelog from(UpdateModel model) {
        var cl = new Changelog();
        cl.getCreated().addAll(convert(model.getCreated(), Changelog::convertItemNoDel));
        cl.getDeleted().addAll(convert(model.getDeleted(), Changelog::convertItemNoDel));
        cl.getUpdated().addAll(convert(model.getUpdated(), Changelog::convertUpdateItem));
        return cl;
    }

    private static Changeable convertUpdateItem(MailModels.UpdateItem item) {
        Item target = convertItemNoDel(item.getItem());
        return switch (target.getType()) {
            case TEAM -> UpdateTeam.builder()
                    .target(target)
                    .oldName(item.getFromName())
                    .newName(item.getToName())
                    .oldType(item.getFromType())
                    .newType(item.getToType())

                    .oldArea(convertItem(item.getOldProductArea()))
                    .newArea(convertItem(item.getNewProductArea()))

                    .removedMembers(convert(item.removedMembers, m -> new Resource(m.getIdent(), m.getName())))
                    .newMembers(convert(item.newMembers, m -> new Resource(m.getIdent(), m.getName())))
                    .build();
            case AREA -> UpdateArea.builder()
                    .target(target)
                    .oldName(item.getFromName())
                    .newName(item.getToName())
                    .oldType(item.getFromType())
                    .newType(item.getToType())

                    .removedMembers(convert(item.removedMembers, m -> new Resource(m.getIdent(), m.getName())))
                    .newMembers(convert(item.newMembers, m -> new Resource(m.getIdent(), m.getName())))
                    .removedTeams(convert(item.removedTeams, Changelog::convertItem))
                    .newTeams(convert(item.newTeams, Changelog::convertItem))
                    .build();
        };
    }

    private static Item convertItemNoDel(TypedItem item) {
        var conv = convertItem(item);
        conv.setDeleted(null);
        return conv;
    }

    private static Item convertItem(TypedItem item) {
        if (item == null) {
            return null;
        }
        return Item.builder()
                .type(TargetType.valueOf(item.getType().name()))
                .id(item.getId())
                .name(item.getName())
                .deleted(item.isDeleted())
                .build();
    }

    enum TargetType {
        TEAM,
        AREA;
    }

    sealed interface Changeable permits UpdateArea, UpdateTeam {

    }
}