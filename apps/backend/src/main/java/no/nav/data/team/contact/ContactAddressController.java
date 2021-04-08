package no.nav.data.team.contact;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.contact.domain.SlackChannel;
import no.nav.data.team.contact.domain.SlackUser;
import no.nav.data.team.contact.dto.ContactAddressResponse;
import no.nav.data.team.integration.slack.SlackClient;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/contactaddress")
@Tag(name = "Contact Address", description = "REST API for Contact Address and slack")
public class ContactAddressController {

    private final SlackClient slackClient;
    private final TeamService service;

    @Operation(summary = "Get ContactAddress for team")
    @ApiResponse(description = "ok")
    @GetMapping("/team/{id}")
    public ResponseEntity<RestResponsePage<ContactAddressResponse>> getContactAddressesByTeamId(@PathVariable UUID id) {
        log.info("Get ContactAddress Team id={}", id);
        Team team = service.get(id);
        return ResponseEntity.ok(new RestResponsePage<>(team.getContactAddresses()).convert(contactAddress -> contactAddress.toResponse(slackClient)));
    }

    // Slack

    @Operation(summary = "Search slack channels")
    @ApiResponse(description = "Channels fetched")
    @GetMapping("/slack/channel/search/{name}")
    public ResponseEntity<RestResponsePage<SlackChannel>> searchSlackChannel(@PathVariable String name) {
        log.info("Slack channel search '{}'", name);
        validateLen(name);
        var channels = slackClient.searchChannel(name);
        log.info("Returned {} channels", channels.size());
        return new ResponseEntity<>(new RestResponsePage<>(channels), HttpStatus.OK);
    }

    @Operation(summary = "Get slack channel")
    @ApiResponse(description = "Channel fetched")
    @GetMapping("/slack/channel/{id}")
    public ResponseEntity<SlackChannel> getSlackChannel(@PathVariable String id) {
        log.info("Slack channel '{}'", id);
        var channel = slackClient.getChannel(id);
        if (channel == null) {
            throw new NotFoundException("no channel for id " + id);
        }
        return new ResponseEntity<>(channel, HttpStatus.OK);
    }

    @Operation(summary = "Get slack user by email")
    @ApiResponse(description = "User fetched")
    @GetMapping("/slack/user/email/{email}")
    public ResponseEntity<SlackUser> getSlackUserByEmail(@PathVariable String email) {
        log.info("Slack user email '{}'", email);
        var user = slackClient.getUserByEmail(email);
        if (user == null) {
            throw new NotFoundException("no user for email " + email);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @Operation(summary = "Get slack user by id")
    @ApiResponse(description = "User fetched")
    @GetMapping("/slack/user/id/{id}")
    public ResponseEntity<SlackUser> getSlackUserById(@PathVariable String id) {
        log.info("Slack user id '{}'", id);
        var user = slackClient.getUserBySlackId(id);
        if (user == null) {
            throw new NotFoundException("no user for id " + id);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    private void validateLen(String name) {
        if (Stream.of(name.split(" ")).sorted().distinct().collect(Collectors.joining("")).length() < 3) {
            throw new ValidationException("Search must be at least 3 characters");
        }
    }
}
