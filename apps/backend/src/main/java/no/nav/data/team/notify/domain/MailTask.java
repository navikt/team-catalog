package no.nav.data.team.notify.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.As;
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@ToString(exclude = {"changeStamp"})
public class MailTask implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;

    private TaskType taskType;
    private TaskObject taskObject;

    public MailTask(TaskObject taskObject) {
        setTaskObject(taskObject);
    }

    public void setTaskObject(TaskObject taskObject) {
        this.taskObject = taskObject;
        this.taskType = TaskType.valueOf(taskObject.getClass().getSimpleName());
    }

    public enum TaskType {
        InactiveMembers
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static final class InactiveMembers implements TaskObject {

        private UUID teamId;
        private UUID clusterId;
        private UUID productAreaId;
        private List<String> identsInactive;

        public static InactiveMembers team(UUID id, List<String> identsInactive) {
            return InactiveMembers.builder().teamId(id).identsInactive(identsInactive).build();
        }

        public static InactiveMembers cluster(UUID id, List<String> identsInactive) {
            return InactiveMembers.builder().clusterId(id).identsInactive(identsInactive).build();
        }

        public static InactiveMembers productArea(UUID id, List<String> identsInactive) {
            return InactiveMembers.builder().productAreaId(id).identsInactive(identsInactive).build();
        }

        public String getType() {
            return teamId != null ? TypeRegistration.typeOf(Team.class)
                    : productAreaId != null ? TypeRegistration.typeOf(ProductArea.class) : TypeRegistration.typeOf(Cluster.class);
        }

        public UUID getId() {
            return StreamUtils.first(teamId, productAreaId, clusterId);
        }
    }

    @JsonTypeInfo(use = Id.NAME, include = As.EXTERNAL_PROPERTY, property = "taskType")
    @JsonSubTypes({
            @Type(value = InactiveMembers.class, name = "InactiveMembers")
    })
    public interface TaskObject {

    }
}
