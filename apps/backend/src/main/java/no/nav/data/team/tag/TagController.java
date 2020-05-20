package no.nav.data.team.tag;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.ValidationException;
import no.nav.data.team.common.rest.RestResponsePage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static no.nav.data.team.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.team.common.utils.StreamUtils.filter;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Slf4j
@RestController
@RequestMapping("/tag")
@Api(value = "Tag endpoint", tags = "Tag")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @ApiOperation(value = "Get tags")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Tags fetched", response = TagPageResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping
    public ResponseEntity<RestResponsePage<String>> getTags() {
        var tags = tagRepository.getTags();
        return new ResponseEntity<>(new RestResponsePage<>(tags), HttpStatus.OK);
    }

    @ApiOperation(value = "Search tags")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Tags fetched", response = TagPageResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<String>> searchTags(@PathVariable String name) {
        String trimmedName = name.trim();
        log.info("Tag search '{}'", trimmedName);
        if (trimmedName.length() < 3) {
            throw new ValidationException("Search resource must be at least 3 characters");
        }
        var tags = filter(tagRepository.getTags(), tag -> containsIgnoreCase(tag, trimmedName));
        tags.sort(startsWith(trimmedName));
        return new ResponseEntity<>(new RestResponsePage<>(tags), HttpStatus.OK);
    }

    static class TagPageResponse extends RestResponsePage<String> {

    }

}
