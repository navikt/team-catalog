package no.nav.data.team.resource.domain;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.cluster.domain.Cluster;
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

import static no.nav.data.common.storage.domain.GenericStorage.getOfType;

@Slf4j
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
        var resp = jdbcTemplate.queryForList(
                "select id from generic_storage where data #>'{members}' @> :member::jsonb and type in ('Team', 'ProductArea', 'Cluster')",
                new MapSqlParameterSource().addValue("member", String.format("[{\"navIdent\": \"%s\"}]", memberIdent))
        );
        var storages = get(resp);
        return new Membership(getOfType(storages, Team.class), getOfType(storages, ProductArea.class), getOfType(storages, Cluster.class));
    }

    @Override
    public List<Membership> findAllByMemberIdents(List<String> memberIdents) {
        log.info("Find all members by member ident {}", memberIdents);
        var resp = jdbcTemplate.queryForList(
            "select id from generic_storage where type in ('Team', 'ProductArea', 'Cluster') " +
            "and exists (select 1 from jsonb_array_elements(data->'members') as m where m->>'navIdent' = any(:members))",
            new MapSqlParameterSource().addValue("members", memberIdents.toArray(new String[0]))
        );

        log.info("Found {} members by member ident {}", resp.size(), resp);
        Map<String, List<UUID>> idsByMember = resp.stream()
                .collect(Collectors.groupingBy(
                        row -> (String) row.get("nav_ident"),
                        Collectors.mapping(row -> (UUID) row.get("id"), Collectors.toList())));

        log.info("Returning members");
        return memberIdents.stream()
                .map(ident -> {
                    var ids = idsByMember.getOrDefault(ident, List.of());
                    var storages = teamRepository.findAllById(ids);
                    return new Membership(getOfType(storages, Team.class), getOfType(storages, ProductArea.class), getOfType(storages, Cluster.class));
                })
                .collect(Collectors.toList());
    }

    private List<GenericStorage> get(List<Map<String, Object>> resp) {
        List<UUID> ids = resp.stream().map(i -> ((UUID) i.values().iterator().next())).collect(Collectors.toList());
        return teamRepository.findAllById(ids);
    }

    public record Membership(List<Team> teams, List<ProductArea> productAreas, List<Cluster> clusters) {

    }

}
