package no.nav.data.team.team;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.team.domain.Team;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;

@Repository
public class TeamRepositoryImpl implements TeamRepositoryCustom {

    private final TeamRepository teamRepository;
    private final NamedParameterJdbcTemplate template;

    public TeamRepositoryImpl(@Lazy TeamRepository teamRepository, NamedParameterJdbcTemplate template) {
        this.teamRepository = teamRepository;
        this.template = template;
    }

    @Override
    public List<Team> findByCluster(UUID teamId) {
        var resp = template.queryForList("select id from generic_storage where data #>'{clusterIds}' ?? :teamId",
                new MapSqlParameterSource().addValue("teamId", teamId.toString()));
        return get(resp);
    }

    private List<Team> get(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return convert(teamRepository.findAllById(ids), GenericStorage::toTeam);
    }
}
