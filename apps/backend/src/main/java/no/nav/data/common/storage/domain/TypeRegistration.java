package no.nav.data.common.storage.domain;

import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.team.location.domain.Floor;
import no.nav.data.team.location.domain.FloorImage;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.Resource;
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
        addDomainClass(ProductArea.class, true);
        addDomainClass(Team.class, true);
        addDomainClass(Settings.class, true);

        addDomainClass(ResourcePhoto.class, false);
        addDomainClass(Resource.class, false);
        addDomainClass(Notification.class, false);

        addDomainClass(Floor.class, true);
        addDomainClass(FloorImage.class, false);
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
