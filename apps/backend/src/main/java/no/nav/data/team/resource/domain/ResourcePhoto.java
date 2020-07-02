package no.nav.data.team.resource.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResourcePhoto implements DomainObject {

    private UUID id;
    private String ident;
    private boolean missing;
    private byte[] content;
    private ChangeStamp changeStamp;
}
