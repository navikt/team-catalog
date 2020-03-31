package no.nav.data.team.resource;

import io.prometheus.client.Gauge;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.security.AzureTokenProvider;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.utils.MetricUtils;
import no.nav.data.team.resource.domain.ResourcePhoto;
import no.nav.data.team.resource.domain.ResourcePhotoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class ResourceService {

    private static Gauge photos = MetricUtils.gauge()
            .name("team_profile_picture_count_gauge").help("Number of profile pictures cached")
            .register();

    private static final Duration PHOTO_CACHE_DURATION = Duration.ofDays(1);

    private final StorageService storage;
    private final ResourcePhotoRepository resourcePhotoRepository;
    private final AzureTokenProvider azureTokenProvider;

    public ResourceService(StorageService storage, ResourcePhotoRepository resourcePhotoRepository, AzureTokenProvider azureTokenProvider) {
        this.storage = storage;
        this.resourcePhotoRepository = resourcePhotoRepository;
        this.azureTokenProvider = azureTokenProvider;
    }

    @Transactional
    public ResourcePhoto getPhoto(String ident) {
        List<GenericStorage> photoStorage = resourcePhotoRepository.findByIdent(ident);

        if (photoStorage.isEmpty()) {
            log.info("Get photo id={} calling graph", ident);
            var picture = azureTokenProvider.lookupProfilePictureByNavIdent(ident);
            return storage.save(ResourcePhoto.builder()
                    .content(picture)
                    .ident(ident)
                    .missing(picture == null)
                    .build()
            );
        }
        if (photoStorage.size() > 1) {
            // Cleanup duplicates from race conditions
            photoStorage.subList(1, photoStorage.size()).forEach(ps -> storage.delete(ps.getId(), ResourcePhoto.class));
        }
        return photoStorage.get(0).getDomainObjectData(ResourcePhoto.class);
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT10M")
    public void cleanOld() {
        log.debug("Deleted {} old photos", storage.deleteCreatedOlderThan(ResourcePhoto.class, LocalDateTime.now().minus(PHOTO_CACHE_DURATION)));
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT1M")
    public void gatherMetrics() {
        photos.set(storage.count(ResourcePhoto.class));
    }
}
