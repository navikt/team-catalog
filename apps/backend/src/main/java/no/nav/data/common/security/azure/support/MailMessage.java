package no.nav.data.common.security.azure.support;

import com.microsoft.graph.models.extensions.EmailAddress;
import com.microsoft.graph.models.extensions.ItemBody;
import com.microsoft.graph.models.extensions.Message;
import com.microsoft.graph.models.extensions.Recipient;
import com.microsoft.graph.models.generated.BodyType;
import lombok.experimental.UtilityClass;

import java.util.List;

@UtilityClass
public class MailMessage {

    public static Message compose(String from, String to, String subject, String messageBody) {
        Message message = new Message();
        message.from = recipient(from, "Teamkatalog");
        message.toRecipients = List.of(recipient(to, null));
        message.subject = subject;
        message.body = new ItemBody();
        message.body.contentType = BodyType.HTML;
        message.body.content = messageBody;
        return message;
    }

    private static Recipient recipient(String to, String name) {
        Recipient recipient = new Recipient();
        recipient.emailAddress = new EmailAddress();
        recipient.emailAddress.address = to;
        recipient.emailAddress.name = name;
        return recipient;
    }

}
