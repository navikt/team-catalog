package no.nav.data.team.common.validator;

public interface Validated {

    default void format() {
    }

    void validate(FieldValidator validator);

}
