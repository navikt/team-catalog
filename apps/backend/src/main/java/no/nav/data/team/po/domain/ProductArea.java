package no.nav.data.team.po.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.common.storage.domain.ChangeStamp;
import no.nav.data.team.common.storage.domain.DomainObject;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductArea implements DomainObject {

    private UUID id;
    private String name;
    private String description;
    private List<String> tags;

    private ChangeStamp changeStamp;
    private boolean updateSent;

    public ProductArea convert(ProductAreaRequest request) {
        name = request.getName();
        description = request.getDescription();
        tags = copyOf(request.getTags());
        updateSent = false;
        return this;
    }

    public ProductAreaResponse convertToResponse() {
        return ProductAreaResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .tags(copyOf(tags))
                .changeStamp(convertChangeStampResponse())
                .build();
    }
}
