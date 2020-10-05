package no.nav.data.team.notify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.notify.domain.Notification.NotificationChannel;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.domain.Notification.NotificationType;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.UUID;

import static org.springframework.util.CollectionUtils.isEmpty;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldNameConstants
public class NotificationDto implements Validated {

    private UUID id;
    private String ident;
    private UUID target;
    private NotificationType type;
    private NotificationTime time;
    private List<NotificationChannel> channels;

    @Override
    public void format() {
        setIdent(StringUtils.trimToNull(ident));
        if (type == NotificationType.ALL_EVENTS) {
            setTarget(null);
        }
        if (isEmpty(channels)) {
            setChannels(List.of(NotificationChannel.EMAIL));
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
