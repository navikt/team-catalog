package no.nav.data.team.common.storage.domain;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.SneakyThrows;
import no.nav.data.team.AppStarter;
import no.nav.data.team.common.auditing.domain.Auditable;
import no.nav.data.team.common.exceptions.TechnicalException;
import no.nav.data.team.common.utils.JsonUtils;
import no.nav.data.team.common.validator.RequestElement;
import org.hibernate.annotations.Type;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;


@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "GENERIC_STORAGE")
public class GenericStorage extends Auditable<String> {

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

    public <T extends DomainObject> void setDomainObjectData(T object) {
        Assert.isTrue(id != null, "id not set");
        Assert.isTrue(type == null || object.type().equals(type), "cannot change object type");
        object.setId(id);
        type = object.type();
        data = JsonUtils.toJsonNode(object);
    }

    public <T extends DomainObject> T getDomainObjectData(Class<T> clazz) {
        validateType(clazz);
        return JsonUtils.toObject(data, clazz);
    }

    public <T extends DomainObject> void validateType(Class<T> clazz) {
        Assert.isTrue(type.equals(GenericStorage.typeOf(clazz)), "Incorrect type");
    }

    public static String typeOf(Class<? extends DomainObject> clazz) {
        return clazz.getSimpleName();
    }

    public static String typeOfRequest(RequestElement request) {
        return request.getRequestType();
    }

    static {
        var provider = new ClassPathScanningCandidateComponentProvider(false);
        provider.addIncludeFilter(new AssignableTypeFilter(DomainObject.class));
        List<String> types = provider.findCandidateComponents(AppStarter.class.getPackageName())
                .stream()
                .map(c -> {
                    try {
                        //noinspection unchecked
                        return (Class<? extends DomainObject>) Class.forName(c.getBeanClassName());
                    } catch (ClassNotFoundException e) {
                        throw new TechnicalException("uh", e);
                    }
                })
                .map(GenericStorage::typeOf)
                .collect(Collectors.toList());
        Assert.isTrue(types.size() == Set.copyOf(types).size(), "Duplicate DomainObject type" + types);
    }

}
