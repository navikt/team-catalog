package no.nav.data.team.naisteam.console;


import no.nav.data.team.naisteam.domain.NaisTeam;

import static java.util.Collections.emptyList;

public record ConsoleTeam (
        String slackChannel,
        String purpose,
        String slug
) implements Named {

    @SuppressWarnings("GraphQLUnresolvedReference")
    public final static String TEAMS_QUERY = //language=graphql
            """
            query {
              teams {
                slackChannel
                purpose
                slug
              }
            }
            """;

    @SuppressWarnings("GraphQLUnresolvedReference")
    public final static String TEAM_QUERY = // language=graphql
            """
            query($slug: String!) {
              team(slug: $slug) {
                slackChannel
                purpose
                slug
              }
            }
            """;

    @Override
    public String getName() {
        return slug;
    }

    public NaisTeam toNaisTeam() {
        return NaisTeam.builder()
                .id(getName())
                .name(getName())
                .description(purpose())
                .slack(slackChannel())
                .naisMembers(emptyList())
                .naisApps(emptyList())
                .build();
    }

}
