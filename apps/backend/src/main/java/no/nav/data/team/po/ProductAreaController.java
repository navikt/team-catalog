package no.nav.data.team.po;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.TeamCatalogProps;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.AddTeamsToProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.UUID;
import javax.validation.Valid;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/productarea")
@Tag(name = "ProductArea", description = "ProductArea endpoint")
public class ProductAreaController {

    private final ProductAreaService service;
    private final TeamCatalogProps teamCatalogProps;

    public ProductAreaController(ProductAreaService service, TeamCatalogProps teamCatalogProps) {
        this.service = service;
        this.teamCatalogProps = teamCatalogProps;
    }

    @Operation(summary = "Get All ProductAreas")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<ProductAreaResponse>> getAll() {
        log.info("Get all ProductAreas");
        return ResponseEntity.ok(new RestResponsePage<>(StreamUtils.convert(service.getAll(), this::convertProductAreaToReponse)));
    }

    @Operation(summary = "Get ProductArea")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<ProductAreaResponse> getById(@PathVariable UUID id) {
        log.info("Get ProductArea id={}", id);
        return ResponseEntity.ok(convertProductAreaToReponse(service.get(id)));
    }

    @Operation(summary = "Search ProductArea")
    @ApiResponse(description = "ProductArea fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<ProductAreaResponse>> searchProductAreaByName(@PathVariable String name) {
        log.info("Received request for ProductArea with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search ProductArea must be at least 3 characters");
        }
        var po = service.search(name);
        log.info("Returned {} po", po.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(po,this::convertProductAreaToReponse)), HttpStatus.OK);
    }

    @Operation(summary = "Create ProductArea")
    @ApiResponse(responseCode = "201", description = "ProductArea created")
    @PostMapping
    public ResponseEntity<ProductAreaResponse> createProductArea(@RequestBody ProductAreaRequest request) {
        log.info("Create ProductArea");
        var productArea = service.save(request);
        return new ResponseEntity<>(convertProductAreaToReponse(productArea), HttpStatus.CREATED);
    }

    @Operation(summary = "Add teams to ProductArea")
    @ApiResponse(description = "Added")
    @PostMapping("/addteams")
    public void addTeams(@RequestBody AddTeamsToProductAreaRequest request) {
        service.addTeams(request);
    }

    @Operation(summary = "Update ProductArea")
    @ApiResponse(description = "ProductArea updated")
    @PutMapping("/{id}")
    public ResponseEntity<ProductAreaResponse> updateProductArea(@PathVariable UUID id, @Valid @RequestBody ProductAreaRequest request) {
        log.debug("Update ProductArea id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var productArea = service.save(request);
        return ResponseEntity.ok(convertProductAreaToReponse(productArea));
    }

    @Operation(summary = "Delete ProductArea")
    @ApiResponse(description = "ProductArea deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductAreaResponse> deleteProductAreaById(@PathVariable UUID id) {
        log.info("Delete ProductArea id={}", id);
        var productArea = service.delete(id);
        return ResponseEntity.ok(convertProductAreaToReponse(productArea));
    }

    static class ProductAreaPageResponse extends RestResponsePage<ProductAreaResponse> {

    }


    private ProductAreaResponse convertProductAreaToReponse(ProductArea pa){
        return pa.convertToResponse(teamCatalogProps.getDefaultProductareaUuid());
    }

}
