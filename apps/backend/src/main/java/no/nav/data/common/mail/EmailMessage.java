package no.nav.data.common.mail;

import java.util.List;

public record EmailMessage(
        Message message
) {
    public EmailMessage(String subject, String content, List<String> recipientsEmailAddresses) {
        this(new Message(subject, recipientsEmailAddresses, new Message.Body("Text", content)));
    }

    public record Message(
            String subject,
            Body body,
            List<Recipient> toRecipients
    ) {

        public Message(String subject, List<String> recipientsEmailAddresses, Body body) {
            this(subject, body, recipientsEmailAddresses.stream().map(Recipient::new).toList());
        }

        public record Body(
                String contentType,
                String content
        ) {}

        public record Recipient(
                EmailAddress emailAddress
        ) {
            public Recipient(String address) {
                this(new EmailAddress(address));
            }

            public record EmailAddress(
                    String address
            ) {}
        }
    }
}