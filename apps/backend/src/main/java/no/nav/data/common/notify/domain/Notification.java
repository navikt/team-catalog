package no.nav.data.common.notify.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import org.apache.commons.lang3.StringUtils;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldNameConstants
public class Notification implements DomainObject, Validated {

    private UUID id;
    private String ident;
    private String email;
    private String target;
    private NotificationType type;
    private NotificationTime time;

    private ChangeStamp changeStamp;

    @Override
    public void format() {
        setIdent(StringUtils.trimToNull(ident));
        setEmail(StringUtils.trimToNull(email));
        setTarget(StringUtils.trimToNull(target));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkBlank(Fields.ident, ident);
        validator.checkBlank(Fields.target, ident);
        validator.checkNull(Fields.type, type);
        validator.checkNull(Fields.time, type);
    }

    public enum NotificationType {
        PA, PA_MEMBERS,
        TEAM, TEAM_MEMBERS
    }

    public enum NotificationTime {
        ALL, DAILY, WEEKLY, MONTHLY
    }
}
