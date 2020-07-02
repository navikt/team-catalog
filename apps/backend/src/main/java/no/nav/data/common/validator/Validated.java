package no.nav.data.common.validator;

public interface Validated {

    default void format() {
    }

    void validateFieldValues(Validator<?> validator);

}
