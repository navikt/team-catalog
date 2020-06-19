package no.nav.data.team.integration.process;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.common.utils.MetricUtils;
import no.nav.data.team.common.web.TraceHeaderFilter;
import no.nav.data.team.integration.process.dto.PcatProcess;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.convert;

@Service
public class ProcessCatalogClient {

    private final WebClient client;
    private final LoadingCache<UUID, List<PcatProcess>> teamCache;
    private final LoadingCache<UUID, List<PcatProcess>> productAreaCache;

    public ProcessCatalogClient(WebClient.Builder webClientBuilder, PcatProperties properties) {
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();

        this.teamCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(100).build(this::findProcessesForTeam);
        MetricUtils.register("processTeamCache", teamCache);

        this.productAreaCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(100).build(this::findProcessesForProductArea);
        MetricUtils.register("processProductAreaCache", productAreaCache);
    }

    public List<ProcessResponse> getProcessesForTeam(UUID id) {
        return convert(teamCache.get(id), PcatProcess::convertToResponse);
    }

    public List<ProcessResponse> getProcessesForProductArea(UUID id) {
        return convert(productAreaCache.get(id), PcatProcess::convertToResponse);
    }

    private List<PcatProcess> findProcessesForTeam(UUID teamId) {
        return getAll("/process?productTeam={teamId}", teamId);
    }

    private List<PcatProcess> findProcessesForProductArea(UUID productAreaId) {
        return getAll("/process?productArea={productAreaId}", productAreaId);
    }

    private List<PcatProcess> getAll(String url, UUID id) {
        List<PcatProcess> processes = new ArrayList<>();
        ProcessPage page = null;
        while (page == null || (page.getPages() - 1 > page.getPageNumber())) {
            page = get(url, id, page == null ? 0 : page.getPageNumber() + 1);
            processes.addAll(page.getContent());
        }
        return processes;
    }

    private ProcessPage get(String url, UUID id, long page) {
        return client.get()
                .uri(url + "&pageSize=250&pageNumber={pageNumber}", id, page)
                .retrieve()
                .bodyToMono(ProcessPage.class).block();
    }

    private static class ProcessPage extends RestResponsePage<PcatProcess> {

    }
}
