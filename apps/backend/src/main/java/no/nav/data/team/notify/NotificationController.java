package no.nav.data.team.notify;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.notify.domain.Notification;
import no.nav.data.team.notify.domain.Notification.NotificationType;
import no.nav.data.team.notify.domain.NotificationRepository;
import no.nav.data.team.notify.dto.Changelog;
import no.nav.data.team.notify.dto.NotificationDto;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@Tag(name = "Notification")
@RequestMapping("/notification")
public class NotificationController {

    private final StorageService storage;
    private final NotificationService service;
    private final NotificationRepository repository;

    public NotificationController(StorageService storage, NotificationService service, NotificationRepository repository) {
        this.storage = storage;
        this.service = service;
        this.repository = repository;
    }

    @Operation(summary = "Get Notifications for current user")
    @ApiResponses(value = {@ApiResponse(description = "Notifications fetched")})
    @GetMapping
    public ResponseEntity<RestResponsePage<NotificationDto>> getForCurrentUser() {
        var ident = SecurityUtils.lookupCurrentIdent();
        if (ident.isEmpty()) {
            return ResponseEntity.ok(new RestResponsePage<>());
        }
        return ResponseEntity.ok(new RestResponsePage<>(getAll(ident.get())));
    }

    @Operation(summary = "Get Notification")
    @ApiResponses(value = {@ApiResponse(description = "Notification fetched")})
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDto> get(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(storage.get(id, Notification.class).convertToDto());
    }

    @Operation(summary = "Save new Notification - immutable")
    @ApiResponses(value = {@ApiResponse(description = "Notification saved")})
    @PostMapping
    public ResponseEntity<NotificationDto> save(@RequestBody NotificationDto dto) {
        return ResponseEntity.ok(service.save(dto).convertToDto());
    }

    @Operation(summary = "Delete Notification")
    @ApiResponses(value = {@ApiResponse(description = "Notification deleted")})
    @DeleteMapping("/{id}")
    public ResponseEntity<NotificationDto> delete(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.delete(id).convertToDto());
    }

    @Operation(summary = "diff test")
    @ApiResponses(value = {@ApiResponse(description = "diff")})
    @GetMapping(value = "/diff", produces = "text/html")
    public ResponseEntity<String> diff(
            @RequestParam(value = "type") NotificationType type,
            @RequestParam(value = "targetId", required = false) UUID targetId,
            @RequestParam(value = "start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        if (targetId == null && type != NotificationType.ALL_EVENTS) {
            throw new ValidationException("need targetId for " + type);
        }
        if (end == null) {
            end = LocalDateTime.now();
        }
        try {
            String changelog = service.changelogMail(type, targetId, start, end);
            return ResponseEntity.ok(changelog);
        } catch (Exception e) {
            log.error("notification diff failed", e);
            return new ResponseEntity<>("error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Changelog")
    @ApiResponses(value = {@ApiResponse(description = "Changelog for team updates")})
    @GetMapping(value = "/changelog")
    public ResponseEntity<Changelog> changelog(
            @RequestParam(value = "type") NotificationType type,
            @RequestParam(value = "targetId", required = false) UUID targetId,
            @RequestParam(value = "start") @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime end
    ) {
        if (targetId == null && type != NotificationType.ALL_EVENTS) {
            throw new ValidationException("need targetId for " + type);
        }
        if (end == null) {
            end = LocalDateTime.now();
        }
        if (!Duration.between(start, end).minusDays(32).isNegative()) {
            throw new ValidationException("Duration is more than 31 days");
        }
        try {
            var changelog = service.changelogJson(type, targetId, start, end);
            return ResponseEntity.ok(changelog);
        } catch (Exception e) {
            log.error("notification diff failed", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "mail test")
    @ApiResponses(value = {@ApiResponse(description = "mail")})
    @GetMapping(value = "/mail", produces = "text/html")
    public ResponseEntity<String> mail() {
        service.testMail();
        return ResponseEntity.ok("ok");
    }

    private List<NotificationDto> getAll(String ident) {
        return convert(GenericStorage.to(repository.findByIdent(ident), Notification.class), Notification::convertToDto);
    }

    static class NotificationPage extends RestResponsePage<NotificationDto> {

    }
}
