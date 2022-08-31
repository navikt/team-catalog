package no.nav.data.team.dashboard;

import com.github.benmanes.caffeine.cache.LoadingCache;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.dashboard.dto.DashResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.util.Objects.requireNonNull;


@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/dash")
@Tag(name = "Dashboard")
public class DashboardController {
    @Autowired
    private LoadingCache<String, DashResponse> dashCache;

    @Operation(summary = "Get Dashboard data")
    @ApiResponse(description = "Data fetched")
    @GetMapping
    public ResponseEntity<DashResponse> getDashboardData() {
        return ResponseEntity.ok(requireNonNull(dashCache.get("singleton")));
    }

    @Scheduled(initialDelayString = "PT2M", fixedRateString = "PT30S")
    public void warmup() {
        getDashboardData();
    }

}
