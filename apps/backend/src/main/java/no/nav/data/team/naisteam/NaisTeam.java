package no.nav.data.team.naisteam;

public record NaisTeam(
        String slackChannel,
        String purpose,
        String slug
) {

    @SuppressWarnings("GraphQLUnresolvedReference")
    public final static String TEAMS_QUERY = //language=graphql
            """
            query ($first: Int, $after: Cursor!) {
              teams(first: $first, after: $after) {
                nodes {
                  slackChannel
                  purpose
                  slug
                }
                pageInfo {
                  hasNextPage
                  endCursor
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
