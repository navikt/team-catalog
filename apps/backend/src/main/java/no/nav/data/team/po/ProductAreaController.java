package no.nav.data.team.po;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.ValidationException;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.common.utils.StreamUtils;
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

import static no.nav.data.team.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/productarea")
@Api(value = "ProductArea endpoint", tags = "ProductArea")
public class ProductAreaController {

    private final ProductAreaService service;

    public ProductAreaController(ProductAreaService service) {
        this.service = service;
    }

    @ApiOperation("Get All ProductAreas")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = ProductAreaPageResponse.class)
    })
    @GetMapping
    public ResponseEntity<RestResponsePage<ProductAreaResponse>> getAll() {
        log.info("Get all ProductAreas");
        return ResponseEntity.ok(new RestResponsePage<>(StreamUtils.convert(service.getAll(), ProductArea::convertToResponse)));
    }

    @ApiOperation("Get ProductArea")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = ProductAreaResponse.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductAreaResponse> getById(@PathVariable UUID id) {
        log.info("Get ProductArea id={}", id);
        return ResponseEntity.ok(service.get(id).convertToResponse());
    }

    @ApiOperation(value = "Search ProductArea")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "ProductArea fetched", response = ProductAreaPageResponse.class)
    })
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<ProductAreaResponse>> searchProductAreaByName(@PathVariable String name) {
        log.info("Received request for ProductArea with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search ProductArea must be at least 3 characters");
        }
        var po = service.search(name);
        log.info("Returned {} po", po.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(po, ProductArea::convertToResponse)), HttpStatus.OK);
    }

    @ApiOperation(value = "Create ProductArea")
    @ApiResponses(value = {
            @ApiResponse(code = 201, message = "ProductArea created", response = ProductAreaResponse.class),
            @ApiResponse(code = 400, message = "Illegal arguments"),
    })
    @PostMapping
    public ResponseEntity<ProductAreaResponse> createProductArea(@RequestBody ProductAreaRequest request) {
        log.info("Create ProductArea");
        var productArea = service.save(request);
        return new ResponseEntity<>(productArea.convertToResponse(), HttpStatus.CREATED);
    }

    @ApiOperation(value = "Add teams to ProductArea")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Added"),
            @ApiResponse(code = 400, message = "Illegal arguments")
    })
    @PostMapping("/addteams")
    public void addTeams(@RequestBody AddTeamsToProductAreaRequest request) {
        service.addTeams(request);
    }

    @ApiOperation(value = "Update ProductArea")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "ProductArea updated", response = ProductAreaResponse.class),
            @ApiResponse(code = 400, message = "Illegal arguments"),
            @ApiResponse(code = 404, message = "ProductArea not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductAreaResponse> updateProductArea(@PathVariable UUID id, @Valid @RequestBody ProductAreaRequest request) {
        log.debug("Update ProductArea id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var productArea = service.save(request);
        return ResponseEntity.ok(productArea.convertToResponse());
    }

    @ApiOperation(value = "Delete ProductArea")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "ProductArea deleted", response = ProductAreaResponse.class),
            @ApiResponse(code = 404, message = "ProductArea not found"),
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductAreaResponse> deleteProductAreaById(@PathVariable UUID id) {
        log.info("Delete ProductArea id={}", id);
        var productArea = service.delete(id);
        return ResponseEntity.ok(productArea.convertToResponse());
    }

    static class ProductAreaPageResponse extends RestResponsePage<ProductAreaResponse> {

    }

}
