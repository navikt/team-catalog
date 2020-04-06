package no.nav.data.team.team;

import no.nav.data.team.team.domain.Team;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static no.nav.data.team.common.utils.StreamUtils.convert;

@Repository
public class TeamRepositoryImpl implements TeamRepositoryCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final TeamRepository teamRepository;

    public TeamRepositoryImpl(NamedParameterJdbcTemplate jdbcTemplate, @Lazy TeamRepository teamRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.teamRepository = teamRepository;
    }

    @Override
    public List<Team> findByMemberIdent(String memberIdent) {
        var resp = jdbcTemplate.queryForList("select id from generic_storage where data #>'{members}' @> :member::jsonb",
                new MapSqlParameterSource().addValue("member", String.format("[{\"navIdent\": \"%s\"}]", memberIdent)));
        return getTeams(resp);
    }

    private List<Team> getTeams(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return convert(teamRepository.findAllById(ids), gs -> gs.getDomainObjectData(Team.class));
    }
}
