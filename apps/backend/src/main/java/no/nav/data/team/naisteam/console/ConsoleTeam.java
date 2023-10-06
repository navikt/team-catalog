package no.nav.data.team.naisteam.console;

public record ConsoleTeam (
        String slackChannel,
        String purpose,
        String slug
) {

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
}
