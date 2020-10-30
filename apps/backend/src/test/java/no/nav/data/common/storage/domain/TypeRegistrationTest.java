package no.nav.data.common.storage.domain;

import no.nav.data.AppStarter;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.util.ClassFilter;
import org.junit.platform.commons.util.ReflectionUtils;

import java.lang.reflect.Modifier;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class TypeRegistrationTest {

    @Test
    void allDomainObjectsAreRegistered() {
        ClassFilter filter = ClassFilter.of(c -> !c.isInterface() && !Modifier.isAbstract(c.getModifiers())
                && Arrays.asList(c.getInterfaces()).contains(DomainObject.class));
        var classes = ReflectionUtils.findAllClassesInPackage(AppStarter.class.getPackageName(), filter);

        classes.forEach(c -> assertThat(TypeRegistration.typeOf(c)).overridingErrorMessage("Class <%s> is not registered", c.getName()).isNotNull());
    }
}