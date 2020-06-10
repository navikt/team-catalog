package no.nav.data.team.resource.domain;

import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.storage.domain.TypeRegistration;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.TeamRepository;
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
import static no.nav.data.team.common.utils.StreamUtils.filter;

@Repository
public class ResourceRepositoryImpl implements ResourceRepositoryCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final TeamRepository teamRepository;

    public ResourceRepositoryImpl(NamedParameterJdbcTemplate jdbcTemplate, @Lazy TeamRepository teamRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.teamRepository = teamRepository;
    }

    @Override
    public Membership findByMemberIdent(String memberIdent) {
        var resp = jdbcTemplate.queryForList("select id from generic_storage where data #>'{members}' @> :member::jsonb",
                new MapSqlParameterSource().addValue("member", String.format("[{\"navIdent\": \"%s\"}]", memberIdent)));
        var storages = get(resp);
        return new Membership(
                convert(filter(storages, r -> r.getType().equals(TypeRegistration.typeOf(Team.class))), GenericStorage::toTeam),
                convert(filter(storages, r -> r.getType().equals(TypeRegistration.typeOf(ProductArea.class))), GenericStorage::toProductArea)
        );
    }

    private List<GenericStorage> get(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return teamRepository.findAllById(ids);
    }

    public record Membership(List<Team>teams, List<ProductArea>productAreas) {

    }

}
