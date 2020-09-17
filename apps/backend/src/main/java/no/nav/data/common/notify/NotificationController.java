package no.nav.data.common.notify;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.NotificationRepository;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@Api(value = "Notification", tags = {"Notification"})
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

    @ApiOperation(value = "Get Notifications for current user")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notifications fetched", response = NotificationPage.class)})
    @GetMapping
    public ResponseEntity<RestResponsePage<NotificationDto>> getForCurrentUser() {
        var ident = SecurityUtils.lookupCurrentIdent();
        if (ident.isEmpty()) {
            return ResponseEntity.ok(new RestResponsePage<>());
        }
        return ResponseEntity.ok(new RestResponsePage<>(getAll(ident.get())));
    }

    @ApiOperation(value = "Get Notification")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notification fetched", response = NotificationDto.class)})
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDto> get(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(storage.get(id, Notification.class).convertToDto());
    }

    @ApiOperation(value = "Save new Notification - immutable")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notification saved", response = Notification.class)})
    @PostMapping
    public ResponseEntity<NotificationDto> save(@RequestBody NotificationDto dto) {
        return ResponseEntity.ok(service.save(dto).convertToDto());
    }

    @ApiOperation(value = "Delete Notification")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Notification deleted", response = Notification.class)})
    @DeleteMapping("/{id}")
    public ResponseEntity<NotificationDto> delete(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.delete(id).convertToDto());
    }

    @ApiOperation(value = "diff test")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "diff", response = String.class)})
    @GetMapping(value = "/diff", produces = "text/html")
    public ResponseEntity<String> diff(@RequestParam(value = "idOne", required = false) UUID idOne, @RequestParam(value = "idTwo", required = false) UUID idTwo) {
        if (idOne == null && idTwo == null) {
            throw new ValidationException("need one id");
        }
        return ResponseEntity.ok(service.testDiff(idOne, idTwo));
    }

    @ApiOperation(value = "mail test")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "mail", response = String.class)})
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
