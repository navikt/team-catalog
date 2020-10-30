package no.nav.data.team.settings;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.settings.dto.Settings;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Tag(description = "Settings", name = "Settings")
@RequestMapping("/settings")
public class SettingsController {

    private final SettingsService service;

    public SettingsController(SettingsService service) {
        this.service = service;
    }

    @Operation(summary = "Get Settings")
    @ApiResponses(value = {@ApiResponse(description = "Settings fetched")})
    @GetMapping
    public ResponseEntity<Settings> get() {
        log.info("Received request for Settings");
        return ResponseEntity.ok(service.getSettings());
    }

    @Operation(summary = "Write Settings")
    @ApiResponses(value = {@ApiResponse(description = "Settings written")})
    @PostMapping
    public ResponseEntity<Settings> write(@RequestBody Settings settings) {
        log.info("Received request to write Settings");
        return ResponseEntity.ok(service.updateSettings(settings));
    }


}
