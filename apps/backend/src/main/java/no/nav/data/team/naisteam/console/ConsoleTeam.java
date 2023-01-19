package no.nav.data.team.naisteam.console;


import no.nav.data.team.naisteam.domain.NaisTeam;

import static java.util.Collections.emptyList;

public record ConsoleTeam (
        boolean enabled,
        String slackAlertsChannel,
        String purpose,
        String slug
) implements Toggleable, Named {

    @SuppressWarnings("GraphQLUnresolvedReference")
    public final static String TEAMS_QUERY = //language=graphql
            """
            query {
              teams {
                enabled
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
                enabled
                slackChannel
                purpose
                slug
              }
            }
            """;

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public String getName() {
        return slug;
    }

    public NaisTeam toNaisTeam() {
        return NaisTeam.builder()
                .id(getName())
                .name(getName())
                .description(purpose())
                .slack(slackAlertsChannel())
                .naisMembers(emptyList())
                .naisApps(emptyList())
                .build();
    }

}
