package no.nav.data.team.cluster;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.dto.ClusterRequest;
import no.nav.data.team.cluster.dto.ClusterResponse;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.UUID;
import javax.validation.Valid;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/cluster")
@Tag(name = "Cluster", description = "Cluster endpoint")
public class ClusterController {

    private final ClusterService service;

    public ClusterController(ClusterService service) {
        this.service = service;
    }

    @Operation(summary = "Get All Clusters")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<ClusterResponse>> getAll(
            @RequestParam(name = "status", required = false, defaultValue = "ACTIVE,PLANNED,INACTIVE") String stringStatus

    ) {
        log.info("Get all Clusters");

        var cluster = service.getAll();

        var queryStatusList = DomainObjectStatus.fromQueryParameter(stringStatus);

        cluster = cluster.stream().filter(t -> queryStatusList.contains(t.getStatus())).toList();


        return ResponseEntity.ok(new RestResponsePage<>(StreamUtils.convert(cluster, Cluster::convertToResponse)));
    }

    @Operation(summary = "Get Cluster")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<ClusterResponse> getById(@PathVariable UUID id) {
        log.info("Get Cluster id={}", id);
        return ResponseEntity.ok(service.get(id).convertToResponse());
    }

    @Operation(summary = "Search Cluster")
    @ApiResponse(description = "Cluster fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<ClusterResponse>> searchClusterByName(@PathVariable String name) {
        log.info("Received request for Cluster with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search Cluster must be at least 3 characters");
        }
        var cluster= service.search(name);
        log.info("Returned {} clusters", cluster.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(cluster, Cluster::convertToResponse)), HttpStatus.OK);
    }

    @Operation(summary = "Create Cluster")
    @ApiResponse(responseCode = "201", description = "Cluster created")
    @PostMapping
    public ResponseEntity<ClusterResponse> createCluster(@RequestBody ClusterRequest request) {
        log.info("Create Cluster");
        var cluster = service.save(request);
        return new ResponseEntity<>(cluster.convertToResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Cluster")
    @ApiResponse(description = "Cluster updated")
    @PutMapping("/{id}")
    public ResponseEntity<ClusterResponse> updateCluster(@PathVariable UUID id, @Valid @RequestBody ClusterRequest request) {
        log.debug("Update Cluster id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var cluster = service.save(request);
        return ResponseEntity.ok(cluster.convertToResponse());
    }

    @Operation(summary = "Delete Cluster")
    @ApiResponse(description = "Cluster deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<ClusterResponse> deleteClusterById(@PathVariable UUID id) {
        log.info("Delete Cluster id={}", id);
        var cluster = service.delete(id);
        return ResponseEntity.ok(cluster.convertToResponse());
    }

    static class ClusterPageResponse extends RestResponsePage<ClusterResponse> {

    }

}
