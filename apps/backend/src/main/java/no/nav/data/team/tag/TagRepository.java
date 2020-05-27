package no.nav.data.team.tag;


import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Repository
public class TagRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public TagRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<String> getTags() {
        List<String> tags = jdbcTemplate.queryForList(
                "select distinct jsonb_array_elements_text(data#>'{tags}') from generic_storage where type = 'Team' or type = 'ProductArea';"
                , Map.of(), String.class);
        tags.sort(Comparator.naturalOrder());
        return tags;
    }

}
