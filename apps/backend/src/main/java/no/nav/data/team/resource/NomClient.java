package no.nav.data.team.resource;

import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceEvent;
import no.nav.data.team.resource.domain.ResourceEvent.EventType;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.settings.SettingsService;
import no.nav.data.team.settings.dto.Settings;
import no.nav.data.team.team.domain.Team;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class
NomClient {
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

    public synchronized void repopulateMemoryStateIfEmpty() {
        if (ResourceState.count() == 0) { // State er tom == Startup => re-laste ResourceState fra basen
            storage.getAll(Resource.class).forEach( r -> {
                    ResourceState.put(r);
                }
            );
        }
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

    @Transactional
    public List<Resource> remove(List<String> tombstoneFids) {
        List<Resource> removed = new ArrayList<>();
        tombstoneFids.forEach(fid ->
            resourceRepository.findByRessursFid(fid).map(GenericStorage::toResource).ifPresent(resource -> {
                resourceRepository.deleteById(resource.getId());
                ResourceState.remove(resource);
                removed.add(resource);
            })
        );

        if (!removed.isEmpty()) {
            Set<String> removedIdents = removed.stream()
                    .map(Resource::getNavIdent)
                    .collect(Collectors.toSet());
            removeMemberReferences(removedIdents);
        }
        return removed;
    }

    private void removeMemberReferences(Set<String> navIdents) {
        storage.getAll(Team.class).stream()
                .filter(team -> teamReferencesIdent(team, navIdents))
                .forEach(team -> {
                    team.setMembers(new ArrayList<>(team.getMembers()));
                    boolean membersRemoved = team.getMembers().removeIf(m -> navIdents.contains(m.getNavIdent()));
                    boolean contactPersonRemoved = navIdents.contains(team.getContactPersonIdent());
                    boolean teamOwnerRemoved = navIdents.contains(team.getTeamOwnerIdent());
                    if (contactPersonRemoved) {
                        team.setContactPersonIdent(null);
                    }
                    if (teamOwnerRemoved) {
                        team.setTeamOwnerIdent(null);
                    }
                    if (membersRemoved || contactPersonRemoved || teamOwnerRemoved) {
                        log.info("Removed resource reference(s) {} from team {} (id={}): members={}, contactPerson={}, teamOwner={}",
                                navIdents, team.getName(), team.getId(), membersRemoved, contactPersonRemoved, teamOwnerRemoved);
                        storage.save(team);
                    }
                });

        storage.getAll(Cluster.class).stream()
                .filter(cluster -> cluster.getMembers().stream().anyMatch(m -> navIdents.contains(m.getNavIdent())))
                .forEach(cluster -> {
                    cluster.setMembers(new ArrayList<>(cluster.getMembers()));
                    boolean membersRemoved = cluster.getMembers().removeIf(m -> navIdents.contains(m.getNavIdent()));
                    if (membersRemoved) {
                        log.info("Removed member(s) {} from cluster {} (id={})", navIdents, cluster.getName(), cluster.getId());
                        storage.save(cluster);
                    }
                });

        storage.getAll(ProductArea.class).stream()
                .filter(pa -> productAreaReferencesIdent(pa, navIdents))
                .forEach(pa -> {
                    pa.setMembers(new ArrayList<>(pa.getMembers()));
                    boolean membersRemoved = pa.getMembers().removeIf(m -> navIdents.contains(m.getNavIdent()));
                    boolean ownersRemoved = false;
                    if (pa.getOwnerGroupNavidentList() != null) {
                        pa.setOwnerGroupNavidentList(new ArrayList<>(pa.getOwnerGroupNavidentList()));
                        ownersRemoved = pa.getOwnerGroupNavidentList().removeIf(navIdents::contains);
                    }
                    if (membersRemoved || ownersRemoved) {
                        log.info("Removed resource reference(s) {} from product area {} (id={}): members={}, owners={}",
                                navIdents, pa.getName(), pa.getId(), membersRemoved, ownersRemoved);
                        storage.save(pa);
                    }
                });
    }

    private boolean teamReferencesIdent(Team team, Set<String> navIdents) {
        return team.getMembers().stream().anyMatch(m -> navIdents.contains(m.getNavIdent()))
                || navIdents.contains(team.getContactPersonIdent())
                || navIdents.contains(team.getTeamOwnerIdent());
    }

    private boolean productAreaReferencesIdent(ProductArea pa, Set<String> navIdents) {
        return pa.getMembers().stream().anyMatch(m -> navIdents.contains(m.getNavIdent()))
                || (pa.getOwnerGroupNavidentList() != null && pa.getOwnerGroupNavidentList().stream().anyMatch(navIdents::contains));
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

        private static final Map<String, Resource> allResources = new ConcurrentHashMap<>(1 << 15);
        private static final Map<String, Resource> allResourcesByMail = new ConcurrentHashMap<>(1 << 15);

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

        static void remove(Resource resource) {
            allResources.remove(resource.getNavIdent().toUpperCase());
            if (resource.getEmail() != null) {
                allResourcesByMail.remove(resource.getEmail().toLowerCase());
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
