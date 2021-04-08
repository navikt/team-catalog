package no.nav.data.team.contact.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.contact.dto.ContactAddressResponse;
import no.nav.data.team.integration.slack.SlackClient;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class ContactAddress implements Validated {

    private String address;
    private Channel type;

    @Override
    public void format() {
        setAddress(trimToNull(address));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(Fields.type, type);
        validator.checkNull(Fields.address, address);
        if (type == Channel.EPOST) {
            validator.checkEmail(Fields.address, address);
        }
    }

    public ContactAddressResponse toResponse(SlackClient slackClient) {
        return ContactAddressResponse.builder()
                .address(address)
                .type(type)
                .slackChannel(type == Channel.SLACK ? slackClient.getChannel(address) : null)
                .slackUser(type == Channel.SLACK_USER ? slackClient.getUserBySlackId(address) : null)
                .build();
    }
}
