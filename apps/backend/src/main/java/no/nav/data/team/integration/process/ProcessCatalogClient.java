package no.nav.data.team.integration.process;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.common.utils.MetricUtils;
import no.nav.data.team.common.web.TraceHeaderFilter;
import no.nav.data.team.integration.process.dto.InfoTypeResponse;
import no.nav.data.team.integration.process.dto.PcatInfoType;
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
    private final LoadingCache<UUID, List<PcatProcess>> processTeamCache;
    private final LoadingCache<UUID, List<PcatProcess>> processProductAreaCache;
    private final LoadingCache<UUID, List<PcatInfoType>> infoTypeTeamCache;
    private final LoadingCache<UUID, List<PcatInfoType>> infoTypeProductAreaCache;

    public ProcessCatalogClient(WebClient.Builder webClientBuilder, PcatProperties properties) {
        this.client = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .filter(new TraceHeaderFilter(true))
                .build();

        this.processTeamCache = MetricUtils.register("pcatProcessTeamCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findProcessesForTeam));

        this.processProductAreaCache = MetricUtils.register("pcatProcessProductAreaCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findProcessesForProductArea));

        this.infoTypeTeamCache = MetricUtils.register("pcatInfoTypeTeamCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findInfoTypesForTeam));

        this.infoTypeProductAreaCache = MetricUtils.register("pcatInfoTypeProductAreaCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(10))
                        .maximumSize(100).build(this::findInfoTypesForProductArea));
    }

    public List<ProcessResponse> getProcessesForTeam(UUID id) {
        return convert(processTeamCache.get(id), PcatProcess::convertToResponse);
    }

    public List<ProcessResponse> getProcessesForProductArea(UUID id) {
        return convert(processProductAreaCache.get(id), PcatProcess::convertToResponse);
    }

    public List<InfoTypeResponse> getInfoTypeForTeam(UUID id) {
        return convert(infoTypeTeamCache.get(id), PcatInfoType::convertToResponse);
    }

    public List<InfoTypeResponse> getInfoTypeForProductArea(UUID id) {
        return convert(infoTypeProductAreaCache.get(id), PcatInfoType::convertToResponse);
    }

    // Internal

    private List<PcatProcess> findProcessesForTeam(UUID teamId) {
        return getAll("/process?productTeam={teamId}", teamId, ProcessPage.class);
    }

    private List<PcatProcess> findProcessesForProductArea(UUID productAreaId) {
        return getAll("/process?productArea={productAreaId}", productAreaId, ProcessPage.class);
    }

    private List<PcatInfoType> findInfoTypesForTeam(UUID teamId) {
        return getAll("/informationtype?productTeam={teamId}", teamId, InfoTypePage.class);
    }

    private List<PcatInfoType> findInfoTypesForProductArea(UUID productAreaId) {
        return getAll("/informationtype?productArea={productAreaId}", productAreaId, InfoTypePage.class);
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

    private static class InfoTypePage extends RestResponsePage<PcatInfoType> {

    }
}
