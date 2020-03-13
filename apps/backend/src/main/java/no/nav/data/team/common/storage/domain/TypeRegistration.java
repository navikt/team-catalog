package no.nav.data.team.common.storage.domain;

import no.nav.data.team.common.validator.RequestElement;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.settings.dto.Settings;
import no.nav.data.team.team.domain.Team;

import java.util.HashMap;
import java.util.Map;

public final class TypeRegistration {

    private static final Map<Class<?>, String> classToType = new HashMap<>();
    private static final Map<String, Class<?>> typeToClass = new HashMap<>();

    static {
        addDomainClass(ProductArea.class);
        addDomainClass(Team.class);
        addDomainClass(Settings.class);
    }

    private TypeRegistration() {
    }

    private static void addDomainClass(Class<? extends DomainObject> aClass) {
        classToType.put(aClass, aClass.getSimpleName());
        typeToClass.put(aClass.getSimpleName(), aClass);
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
