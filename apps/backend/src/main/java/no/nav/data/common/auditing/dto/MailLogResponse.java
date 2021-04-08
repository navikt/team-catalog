package no.nav.data.common.auditing.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.contact.domain.Channel;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "time", "to", "subject", "body", "channel"})
public class MailLogResponse {

    private UUID id;
    private LocalDateTime time;
    private String to;
    private String subject;
    private String body;
    private Channel channel;

}
