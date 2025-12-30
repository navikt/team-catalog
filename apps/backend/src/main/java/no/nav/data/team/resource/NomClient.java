package no.nav.data.team.resource;

import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceEvent;
import no.nav.data.team.resource.domain.ResourceEvent.EventType;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.settings.SettingsService;
import no.nav.data.team.settings.dto.Settings;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class
NomClient {

    private static final int MAX_SEARCH_RESULTS = 100;

    private static final Gauge gauge = MetricUtils.gauge()
            .name("nom_resources_gauge").help("Resources from nom indexed").register();
    private static final Gauge dbGauge = MetricUtils.gauge()
            .name("nom_resources_db_gauge").help("Resources from nom in db").register();
    private static final Counter counter = MetricUtils.counter()
            .name("nom_resources_read_counter").help("Resource events processed").register();
    private static final Counter discardCounter = MetricUtils.counter()
            .name("nom_resources_discard_counter").help("Resource events discarded").register();

    private final StorageService storage;
    private final SettingsService settingsService;
    private final ResourceRepository resourceRepository;

    private static NomClient instance;

    public static NomClient getInstance() {
        return instance;
    }

    public NomClient(StorageService storage, SettingsService settingsService, ResourceRepository resourceRepository) {
        this.storage = storage;
        this.settingsService = settingsService;
        this.resourceRepository = resourceRepository;

        instance = this;
    }

    public Optional<Resource> getByNavIdent(String navIdent) {
        return ResourceState.get(navIdent)
                .or(() -> resourceRepository.findByIdent(navIdent).map(GenericStorage::toResource).map(Resource::stale))
                .filter(r -> shouldReturn(r.getNavIdent()));
    }

    public Optional<Resource> getByEmail(String email) {
        return ResourceState.getByEmail(email)
                .filter(r -> shouldReturn(r.getNavIdent()));
    }

    public Optional<String> getNameForIdent(String navIdent) {
        return Optional.ofNullable(navIdent)
                .filter(this::shouldReturn)
                .flatMap(this::getByNavIdent)
                .map(Resource::getFullName);
    }


    public List<Resource> add(List<NomRessurs> nomResources) {
        if (count() == 0) { // State er tom == Startup => re-laste ResourceState fra basen
            storage.getAll(Resource.class).forEach( r -> {
                    if (r.getNavIdent().equals("M166609")) log.debug("Adding M166609 to repo");
                    ResourceState.put(r);
                }
            );
        }
        var toSave = new ArrayList<Resource>();

        Map<String, Resource> existingState = ResourceState.findAll(convert(nomResources, NomRessurs::getNavident)).stream().collect(Collectors.toMap(Resource::getNavIdent, r -> r));
        for (NomRessurs nomResource : nomResources) {
            var resource = new Resource(nomResource);
            ResourceStatus status = shouldSave(existingState, resource);
            if (status.shouldSave) {
                toSave.add(resource);
                if (status.previous != null) {
                    checkEvents(status.previous, resource);
                }
                ResourceState.put(resource);
            }

            if (resource.getResourceType() == ResourceType.OTHER) {
                // Other resource types shouldn't be searchable, they should not ordinarily be a part of teams
                // todo, see if this is replicated in the nom-api based search
                discardCounter.inc();
                continue;
            }

            counter.inc();
        }
        storage.saveAll(toSave);
        gauge.set(count());
        return toSave;

    }

    private ResourceStatus shouldSave(Map<String, Resource> existing, Resource resource) {
        var exsistingResource = existing.get(resource.getNavIdent());
        boolean gotNewerOffsetOnTopic = exsistingResource == null || exsistingResource.getOffset() < resource.getOffset();
        boolean newResourceDiffersFromExisting = exsistingResource == null || !exsistingResource.convertToResponse().equals(resource.convertToResponse());
        if(newResourceDiffersFromExisting || gotNewerOffsetOnTopic){
            var r1 = exsistingResource == null ? null : exsistingResource.convertToResponse();
            var r2 = resource.convertToResponse();
            var o1 = exsistingResource == null ? null :exsistingResource.getOffset();
            var o2 = resource.getOffset();
            var p1 = exsistingResource == null ? null :exsistingResource.getPartition();
            var p2 = resource.getPartition();
            var eq = exsistingResource == null ? null : exsistingResource.convertToResponse().equals(resource.convertToResponse());
            log.info("""
                            Diff on response is not equivalent to difference in offset for navident {}
                            r1: {}
                            r2: {}
                            offs1: {}
                            offs2: {}
                            partition1: {}
                            partition2: {}
                            r1.resp == r2.resp: {}""",
                    resource.getNavIdent(),r1,r2,o1,o2,p1, p2, eq);
        }
        return new ResourceStatus(gotNewerOffsetOnTopic, exsistingResource);
    }

    private void checkEvents(Resource previous, Resource current) {
        if (!previous.isInactive() && current.isInactive()) {
            log.info("ident {} became inactive, creating ResourceEvent", current.getNavIdent());
            storage.save(ResourceEvent.builder().eventType(EventType.INACTIVE).ident(current.getNavIdent()).build());
        }
    }

    public long count() {
        return ResourceState.count();
    }

    public long countDb() {
        return resourceRepository.count();
    }

    public void clear() {
        ResourceState.clear();
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT1M")
    public void metrics() {
        gauge.set(count());
        dbGauge.set(countDb());
    }

    @Scheduled(initialDelayString = "PT10M", fixedRateString = "PT10M")
    public void cleanup() {
        resourceRepository.cleanup();
    }


    private boolean shouldReturn(String navIdent) {
        Settings settings = settingsService.getSettingsCached();
        // null only for tests
        return settings == null || !settings.isFilteredIdent(navIdent);
    }

    record ResourceStatus(boolean shouldSave, Resource previous) {

    }

    private static class ResourceState {

        static final String FIELD_IDENT = "ident";

        private static final Map<String, Resource> allResources = new HashMap<>(1 << 15);
        private static final Map<String, Resource> allResourcesByMail = new HashMap<>(1 << 15);

        static Optional<Resource> get(String ident) {
            return Optional.ofNullable(allResources.get(ident.toUpperCase()));
        }

        static List<Resource> findAll(List<String> idents) {
            return allResources.values().stream().filter(r -> idents.contains(r.getNavIdent())).toList();
        }

        static Optional<Resource> getByEmail(String email) {
            return Optional.ofNullable(allResourcesByMail.get(email.toLowerCase()));
        }

        static void put(Resource resource) {
            allResources.put(resource.getNavIdent().toUpperCase(), resource);
            if (resource.getEmail() != null) {
                allResourcesByMail.put(resource.getEmail().toLowerCase(), resource);
            }
        }

        static int count() {
            return allResources.size();
        }

        static void clear() {
            allResources.clear();
            allResourcesByMail.clear();
        }
    }
}
