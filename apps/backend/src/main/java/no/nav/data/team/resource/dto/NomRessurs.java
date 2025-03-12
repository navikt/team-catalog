package no.nav.data.team.resource.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.domain.ResourceType;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.util.Objects;
import java.util.stream.Stream;

@SuppressWarnings("SpellCheckingInspection")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"partition", "offset"})
public class NomRessurs {

    private String personident;
    private String navident;
    private String ressurstype;
    private String fornavn;
    private String etternavn;
    private String epost;
    private Boolean permisjon;
    private LocalDate startdato;
    private LocalDate sluttdato;

    private int partition;
    private long offset;

    public String getFullName() {
        return StringUtils.trimToNull(
                StringUtils.trimToEmpty(fornavn) + " " + StringUtils.trimToEmpty(etternavn)
        );
    }

    public NomRessurs addKafkaData(int partition, long offset) {
        this.partition = partition;
        this.offset = offset;
        return this;
    }

    public static NomRessurs fromRessursState(RessursState ressursState) {
        return NomRessurs.builder()
                .personident(ressursState.personident())
                .navident(ressursState.navident())
                .ressurstype("EKSTERN".equals(ressursState.sektor()) ? "EKSTERN" : "INTERN")
                .fornavn(String.join(" ", Stream.of(
                                ressursState.visningsnavn().fornavn(),
                                ressursState.visningsnavn().mellomnavn()
                        ).filter(Objects::nonNull).toList()))
                .etternavn(ressursState.visningsnavn().etternavn())
                .startdato(ressursState.startdato())
                .sluttdato(ressursState.sluttdato())
                .build();
    }
}
