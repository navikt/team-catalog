package no.nav.data.common.storage.domain;

import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.azure.support.MailLog;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.notify.domain.GenericNotificationTask;
import no.nav.data.team.notify.domain.Notification;
import no.nav.data.team.notify.domain.NotificationState;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceEvent;
import no.nav.data.team.resource.domain.ResourcePhoto;
import no.nav.data.team.settings.dto.Settings;
import no.nav.data.team.team.domain.Team;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public final class TypeRegistration {

    private static final Map<Class<?>, String> classToType = new HashMap<>();
    private static final Map<String, Class<?>> typeToClass = new HashMap<>();
    private static final Set<String> auditedTypes = new HashSet<>();

    static {
        addDomainClass(Team.class, true);
        addDomainClass(ProductArea.class, true);
        addDomainClass(Cluster.class, true);
        addDomainClass(Settings.class, true);

        addDomainClass(ResourcePhoto.class, false);
        addDomainClass(Resource.class, false);
        addDomainClass(ResourceEvent.class, false);
        addDomainClass(MailTask.class, false);
        addDomainClass(MailLog.class, false);
        addDomainClass(GenericNotificationTask.class, false);

        addDomainClass(Notification.class, false);
        addDomainClass(NotificationState.class, false);
        addDomainClass(NotificationTask.class, false);
    }

    private TypeRegistration() {
    }

    private static void addDomainClass(Class<? extends DomainObject> aClass, boolean audited) {
        String typeName = aClass.getSimpleName();
        classToType.put(aClass, typeName);
        typeToClass.put(typeName, aClass);
        if (audited) {
            auditedTypes.add(typeName);
        }
    }

    public static boolean isAudited(String type) {
        return auditedTypes.contains(type);
    }

    public static String typeOf(Class<?> clazz) {
        return classToType.get(clazz);
    }

    public static String typeOfRequest(RequestElement request) {
        return request.getRequestType();
    }

    @SuppressWarnings("unchecked")
    public static <T> Class<T> classFrom(String type) {
        Class<?> aClass = typeToClass.get(type);
        return (Class<T>) aClass;
    }
}
