package no.nav.data.team.naisteam;

public record NaisTeam(
        String slackChannel,
        String purpose,
        String slug
) {

    @SuppressWarnings("GraphQLUnresolvedReference")
    public final static String TEAMS_QUERY = //language=graphql
            """
            query ($limit: Int, $offset: Int) {
              teams(limit: $limit, offset: $offset) {
                nodes {
                  slackChannel
                  purpose
                  slug
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
            """;

    @SuppressWarnings("GraphQLUnresolvedReference")
    public final static String TEAM_QUERY = // language=graphql
            """
            query($slug: Slug!) {
              team(slug: $slug) {
                slackChannel
                purpose
                slug
              }
            }
            """;
}
