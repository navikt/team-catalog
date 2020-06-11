package no.nav.data.team.member;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.member.dto.MembershipResponse;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.team.domain.Team;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static no.nav.data.team.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/member")
@Api(value = "Member endpoint", tags = "Member")
public class MemberController {

    private final ResourceRepository resourceRepository;

    public MemberController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @ApiOperation("Get Memberships")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = MembershipResponse.class)
    })
    @GetMapping("/membership/{id}")
    public ResponseEntity<MembershipResponse> getAll(@PathVariable String id) {
        var memberships = resourceRepository.findByMemberIdent(id);
        return ResponseEntity.ok(new MembershipResponse(
                convert(memberships.teams(), Team::convertToResponse),
                convert(memberships.productAreas(), ProductArea::convertToResponse))
        );
    }


}
