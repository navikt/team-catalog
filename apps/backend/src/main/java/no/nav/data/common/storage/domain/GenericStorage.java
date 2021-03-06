package no.nav.data.common.storage.domain;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.team.domain.Team;
import org.hibernate.annotations.Type;
import org.springframework.util.Assert;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import static no.nav.data.common.utils.StreamUtils.convert;


@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "GENERIC_STORAGE")
public class GenericStorage extends Auditable {

    @Id
    @Type(type = "pg-uuid")
    @Column(name = "ID")
    private UUID id;

    @NotNull
    @Column(name = "TYPE", nullable = false, updatable = false)
    private String type;

    @Type(type = "jsonb")
    @Column(name = "DATA", nullable = false)
    private JsonNode data;

    public GenericStorage generateId() {
        Assert.isTrue(id == null, "id already set");
        id = UUID.randomUUID();
        return this;
    }

    public <T extends DomainObject> GenericStorage setDomainObjectData(T object) {
        Assert.isTrue(id != null, "id not set");
        Assert.isTrue(type == null || object.type().equals(type), "cannot change object type");
        object.setId(id);
        type = object.type();
        data = JsonUtils.toJsonNode(object);
        return this;
    }

    public <T extends DomainObject> T getDomainObjectData(Class<T> clazz) {
        validateType(clazz);
        T object = JsonUtils.toObject(data, clazz);
        object.setChangeStamp(new ChangeStamp(getCreatedBy(), getCreatedDate(), getLastModifiedBy(), getLastModifiedDate()));
        return object;
    }

    public <T extends DomainObject> void validateType(Class<T> clazz) {
        Assert.isTrue(type.equals(TypeRegistration.typeOf(clazz)), "Incorrect type");
    }

    public Team toTeam() {
        return getDomainObjectData(Team.class);
    }

    public ProductArea toProductArea() {
        return getDomainObjectData(ProductArea.class);
    }

    public Cluster toCluster() {
        return getDomainObjectData(Cluster.class);
    }

    public Resource toResource() {
        return getDomainObjectData(Resource.class);
    }

    public MailLog toMailLog() {
        return getDomainObjectData(MailLog.class);
    }

    public static <T extends DomainObject> List<T> getOfType(Collection<GenericStorage> storages, Class<T> type) {
        return convert(StreamUtils.filter(storages, r -> r.getType().equals(TypeRegistration.typeOf(type))), gs -> gs.getDomainObjectData(type));
    }

    public static <T extends DomainObject> List<T> to(List<GenericStorage> collection, Class<T> type) {
        return convert(collection, item -> item.getDomainObjectData(type));
    }
}
