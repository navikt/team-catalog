package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.location.dto.LocationSimplePathResponse;

import java.time.DayOfWeek;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficeHoursResponse {
    private LocationSimplePathResponse location;
    private List<DayOfWeek> days;
    private String information;
}
