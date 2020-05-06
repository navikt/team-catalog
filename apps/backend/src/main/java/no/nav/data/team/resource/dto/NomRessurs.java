package no.nav.data.team.resource.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;

@SuppressWarnings("SpellCheckingInspection")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NomRessurs {

    private String personident;
    private String navident;
    private String ressurstype;
    private String fornavn;
    private String etternavn;
    private String epost;
    private LocalDate startdato;
    private LocalDate sluttdato;

    private String key;
    private int partition;
    private long offset;

    public String getFullName() {
        return StringUtils.trimToNull(
                StringUtils.trimToEmpty(fornavn) + " " + StringUtils.trimToEmpty(etternavn)
        );
    }

    public NomRessurs addKafkaData(String key, int partition, long offset) {
        this.key = key;
        this.partition = partition;
        this.offset = offset;
        return this;
    }
}
