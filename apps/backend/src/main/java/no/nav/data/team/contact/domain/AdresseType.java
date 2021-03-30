package no.nav.data.team.contact.domain;

public enum AdresseType {
    EPOST,
    SLACK,
    /**
     * uses userId
     * - a user has a slackId that people can use to create conversationId ('channelId') is person/bot specific
     * - slack urls use userId for linking
     */
    SLACK_USER

}
