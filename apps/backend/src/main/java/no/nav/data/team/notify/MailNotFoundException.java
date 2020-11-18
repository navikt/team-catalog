package no.nav.data.team.notify;

import no.nav.data.common.exceptions.NotFoundException;

public class MailNotFoundException extends NotFoundException {

    public MailNotFoundException(String message) {
        super(message);
    }
}
