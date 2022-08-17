package no.nav.data.team.dashboard;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.dashboard.dto.DashResponse.RoleCount;
import no.nav.data.team.dashboard.dto.DashResponse.TeamSummary;
import no.nav.data.team.dashboard.dto.DashResponse.TeamTypeCount;
import no.nav.data.team.location.LocationRepository;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.shared.domain.Member;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.copyOf;
import static no.nav.data.common.utils.StreamUtils.filter;


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
