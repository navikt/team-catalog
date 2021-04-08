package no.nav.data.team.settings;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.mail.EmailService;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.notify.NotificationService;
import no.nav.data.team.team.domain.Team;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin ops")
@RequestMapping("/admin")
public class AdminController {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final StorageService storage;

    @Operation(summary = "mail test")
    @ApiResponses(value = {@ApiResponse(description = "mail")})
    @GetMapping(value = "/mail", produces = "text/html")
    public ResponseEntity<String> mail() {
        testMail();
        return ResponseEntity.ok("ok");
    }

    @Operation(summary = "trigger nudge")
    @ApiResponses(value = {@ApiResponse(description = "nudge")})
    @PostMapping(value = "/nudge", produces = "text/html")
    public ResponseEntity<String> nudge(@RequestParam(value = "teamId") UUID teamId) {
        var team = storage.get(teamId, Team.class);
        notificationService.nudge(team);
        return ResponseEntity.ok("ok");
    }

    public void testMail() {
        var email = SecurityUtils.getCurrentUser().map(UserInfo::getEmail).orElseThrow();
        emailService.sendMail(MailTask.builder().to(email).subject("test").body("testbody").build());
    }

}
