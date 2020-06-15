package no.nav.data.team.resource;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.prometheus.client.Gauge;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.security.azure.AzureAdService;
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

    private static final Gauge photos = MetricUtils.gauge()
            .name("team_profile_picture_count_gauge").help("Number of profile pictures cached")
            .register();

    private static final Duration PHOTO_DB_DURATION = Duration.ofDays(1);
    private static final Duration PHOTO_MEM_DURATION = Duration.ofHours(1);
    private final Cache<String, byte[]> photoCache;

    private final StorageService storage;
    private final ResourcePhotoRepository resourcePhotoRepository;
    private final AzureAdService azureAdService;

    public ResourceService(StorageService storage, ResourcePhotoRepository resourcePhotoRepository, AzureAdService azureAdService) {
        this.storage = storage;
        this.resourcePhotoRepository = resourcePhotoRepository;
        this.azureAdService = azureAdService;
        this.photoCache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(PHOTO_MEM_DURATION)
                .maximumSize(200).build();
    }

    @Transactional
    public byte[] getPhoto(String ident, boolean forceUpdate) {
        var cached = photoCache.getIfPresent(ident);
        if (!forceUpdate && cached != null) {
            return cached;
        }
        List<GenericStorage> photoStorage = resourcePhotoRepository.findByIdent(ident);
        if (forceUpdate) {
            photoStorage.forEach(photo -> storage.delete(photo.getId(), ResourcePhoto.class));
            photoStorage = List.of();
        }

        if (photoStorage.isEmpty()) {
            log.info("Get photo id={} calling graph", ident);
            var picture = azureAdService.lookupProfilePictureByNavIdent(ident);
            return getPhoto(storage.save(ResourcePhoto.builder()
                    .content(picture)
                    .ident(ident)
                    .missing(picture == null)
                    .build()
            ));
        }
        if (photoStorage.size() > 1) {
            // Cleanup duplicates from race conditions
            photoStorage.subList(1, photoStorage.size()).forEach(ps -> storage.delete(ps.getId(), ResourcePhoto.class));
        }
        return getPhoto(photoStorage.get(0).getDomainObjectData(ResourcePhoto.class));
    }

    private byte[] getPhoto(ResourcePhoto photo) {
        photoCache.put(photo.getIdent(), photo.getContent());
        return photo.getContent();
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT10M")
    public void cleanOld() {
        log.debug("Deleted {} old photos", storage.deleteCreatedOlderThan(ResourcePhoto.class, LocalDateTime.now().minus(PHOTO_DB_DURATION)));
    }

    @Scheduled(initialDelayString = "PT1M", fixedRateString = "PT1M")
    public void gatherMetrics() {
        photos.set(storage.count(ResourcePhoto.class));
    }
}
