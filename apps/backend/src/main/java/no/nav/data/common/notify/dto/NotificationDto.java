package no.nav.data.common.notify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.Notification.NotificationType;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import org.apache.commons.lang3.StringUtils;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldNameConstants
public class NotificationDto implements Validated {

    private UUID id;
    private String ident;
    private String target;
    private NotificationType type;
    private NotificationTime time;

    private ChangeStampResponse changeStamp;

    @Override
    public void format() {
        setIdent(StringUtils.trimToNull(ident));
        setTarget(StringUtils.trimToNull(target));
        if (type == NotificationType.ALL_EVENTS) {
            setTarget(null);
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkNull(Fields.type, type);
        validator.checkNull(Fields.time, type);
        validator.checkBlank(Fields.ident, ident);
        if (!NotificationType.ALL_EVENTS.equals(type)) {
            validator.checkBlank(Fields.target, ident);
        }
    }
}
