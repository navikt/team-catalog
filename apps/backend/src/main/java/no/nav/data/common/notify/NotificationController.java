package no.nav.data.common.notify;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.NotificationRepository;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@Api(value = "Notification", tags = {"Notification"})
@RequestMapping("/notification")
public class NotificationController {

    private final StorageService storage;
    private final NotificationRepository repository;

    public NotificationController(StorageService storage, NotificationRepository repository) {
        this.storage = storage;
        this.repository = repository;
    }

    @ApiOperation(value = "Get Notifications for current user")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notifications fetched", response = NotificationPage.class)})
    @GetMapping
    public ResponseEntity<RestResponsePage<Notification>> getForCurrentUser() {
        var ident = SecurityUtils.lookupCurrentIdent();
        if (ident.isEmpty()) {
            return ResponseEntity.ok(new RestResponsePage<>());
        }
        List<Notification> notifications = GenericStorage.to(repository.findByIdent(ident.get()), Notification.class);
        return ResponseEntity.ok(new RestResponsePage<>(notifications));
    }

    @ApiOperation(value = "Get Notification")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notification fetched", response = Notification.class)})
    @GetMapping("/{id}")
    public ResponseEntity<Notification> get(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(storage.get(id, Notification.class));
    }

    @ApiOperation(value = "Write Notification")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notification written", response = Notification.class)})
    @PostMapping
    public ResponseEntity<Notification> write(@RequestBody Notification notification) {
        notification.validate();
        SecurityUtils.assertIsUserOrAdmin(notification.getIdent(), "Cannot edit other users notifications");
        Optional.ofNullable(notification.getId()).ifPresent(id ->
                Assert.isTrue(notification.getIdent().equals(storage.get(id, Notification.class).getIdent()), "Cannot change ident on notification"));

        if (notification.getEmail() == null || !SecurityUtils.isAdmin()) {
            var email = SecurityUtils.getCurrentUser().map(UserInfo::getEmail).orElseThrow(() -> new ValidationException("No email given"));
            notification.setEmail(email);
        }

        return ResponseEntity.ok(storage.save(notification));
    }

    @ApiOperation(value = "Delete Notification")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notification deleted", response = Notification.class)})
    @DeleteMapping("/{id}")
    public ResponseEntity<Notification> write(@PathVariable("id") UUID id) {
        var notification = storage.get(id, Notification.class);
        SecurityUtils.assertIsUserOrAdmin(notification.getIdent(), "Cannot delete other users notifications");
        return ResponseEntity.ok(storage.delete(id, Notification.class));
    }

    static class NotificationPage extends RestResponsePage<Notification> {

    }
}
