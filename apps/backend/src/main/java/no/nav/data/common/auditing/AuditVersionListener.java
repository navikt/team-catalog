package no.nav.data.common.auditing;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.domain.Auditable;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.HibernateUtils;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.MdcUtils;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.util.Assert;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonGenerator;
import tools.jackson.databind.ObjectWriter;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ser.FilterProvider;
import tools.jackson.databind.ser.PropertyWriter;
import tools.jackson.databind.ser.std.SimpleBeanPropertyFilter;
import tools.jackson.databind.ser.std.SimpleFilterProvider;

import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.storage.domain.TypeRegistration.isAudited;

@Slf4j
public class AuditVersionListener {

    private static AuditVersionRepository repository;

    private static final ObjectWriter wr;

    static {
        FilterProvider filters = new SimpleFilterProvider().addFilter("relationFilter", new RelationFilter());
        wr = JsonUtils.createJsonMapper().rebuild()
                .changeDefaultVisibility(vc -> vc
                        .withVisibility(PropertyAccessor.ALL, Visibility.NONE)
                        .withVisibility(PropertyAccessor.FIELD, Visibility.ANY))
                .build()
                .writer(filters);
    }

    public static void setRepo(AuditVersionRepository repository) {
        AuditVersionListener.repository = repository;
    }

    @PrePersist
    public void prePersist(Object entity) {
        audit(entity, Action.CREATE);
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        audit(entity, Action.UPDATE);
    }

    @PreRemove
    public void preRemove(Object entity) {
        audit(entity, Action.DELETE);
    }

    private void audit(Object entity, Action action) {
        Assert.isTrue(entity instanceof Auditable, "Invalid object");
        if (entity instanceof GenericStorage gs && !isAudited((gs).getType())) {
            return;
        }
        AuditVersion auditVersion = convertAuditVersion(entity, action);
        if (auditVersion != null) {
            repository.save(auditVersion);
        }
    }

    public static AuditVersion convertAuditVersion(Object entity, Action action) {
        try {
            String tableName;
            if (entity instanceof GenericStorage gs) {
                tableName = gs.getType();
            } else {
                tableName = AuditVersion.tableName(((Auditable) entity).getClass());
            }
            String id = getIdForObject(entity);
            String data = wr.writeValueAsString(entity);
            String user = Optional.ofNullable(MdcUtils.getUser()).orElse("no user set");
            return AuditVersion.builder()
                    .action(action).table(tableName).tableId(id).data(data).user(user)
                    .build();
        } catch (JacksonException e) {
            log.error("failed to serialize object", e);
            return null;
        }
    }

    public static String getIdForObject(Object entity) {
        UUID uuid = HibernateUtils.getId(entity);
        Assert.notNull(uuid, "entity has not set id");
        return uuid.toString();
    }

    private static class RelationFilter extends SimpleBeanPropertyFilter {
        @Override
        public void serializeAsProperty(Object pojo, JsonGenerator jgen, SerializationContext provider, PropertyWriter writer) throws Exception {
            boolean root = jgen.streamWriteContext().getParent().getParent() == null;
            boolean isEntity = pojo.getClass().isAnnotationPresent(Entity.class) || pojo instanceof HibernateProxy;
            if (root || !isEntity) {
                super.serializeAsProperty(pojo, jgen, provider, writer);
            } else {
                String fieldName = writer.getName();
                if (fieldName.equals("id")) {
                    UUID id = HibernateUtils.getId(pojo);
                    jgen.writeName(fieldName);
                    jgen.writeString(id.toString());
                }
            }
        }
    }
}
