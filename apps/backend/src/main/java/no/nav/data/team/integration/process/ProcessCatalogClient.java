package no.nav.data.team.integration.process;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.web.TraceHeaderFilter;
import no.nav.data.team.integration.process.dto.PcatProcess;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Service
public class ProcessCatalogClient {

    private final WebClient client;
    private final LoadingCache<UUID, List<PcatProcess>> processTeamCache;

    public ProcessCatalogClient(WebClient.Builder webClientBuilder, PcatProperties properties) {
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();

        this.processTeamCache = MetricUtils.register("pcatProcessTeamCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findProcessesForTeam));
    }

    public List<ProcessResponse> getProcessesForTeam(UUID id) {
        return convert(processTeamCache.get(id), PcatProcess::convertToResponse);
    }

    // Internal

    private List<PcatProcess> findProcessesForTeam(UUID teamId) {
        return getAll("/process?productTeam={teamId}", teamId, ProcessPage.class);
    }

    private <T extends RestResponsePage<R>, R> List<R> getAll(String url, UUID id, Class<T> type) {
        List<R> items = new ArrayList<>();
        T page = null;
        while (page == null || (page.getPages() - 1 > page.getPageNumber())) {
            page = get(url, id, page == null ? 0 : page.getPageNumber() + 1, type);
            items.addAll(page.getContent());
        }
        return items;
    }

    private <T> T get(String url, UUID id, long page, Class<T> type) {
        return client.get()
                .uri(url + "&pageSize=250&pageNumber={pageNumber}", id, page)
                .retrieve()
                .bodyToMono(type).block();
    }

    private static class ProcessPage extends RestResponsePage<PcatProcess> {

    }

}
