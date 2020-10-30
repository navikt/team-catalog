package no.nav.data.team.tag;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static no.nav.data.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.common.utils.StreamUtils.filter;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Slf4j
@RestController
@RequestMapping("/tag")
@Tag(name = "Tag")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Operation(summary = "Get tags")
    @ApiResponse(description = "Tags fetched")
    @GetMapping
    public ResponseEntity<RestResponsePage<String>> getTags() {
        var tags = tagRepository.getTags();
        return new ResponseEntity<>(new RestResponsePage<>(tags), HttpStatus.OK);
    }

    @Operation(summary = "Search tags")
    @ApiResponse(description = "Tags fetched")
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
