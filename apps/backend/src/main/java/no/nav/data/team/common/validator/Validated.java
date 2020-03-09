package no.nav.data.team.common.validator;

public interface Validated {

    default void format() {
    }

    void validateFieldValues(Validator<?> validator);

}
