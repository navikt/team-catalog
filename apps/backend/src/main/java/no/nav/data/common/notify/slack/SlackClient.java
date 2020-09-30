package no.nav.data.common.notify.slack;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.common.notify.slack.dto.SlackDtos.CreateConversationRequest;
import no.nav.data.common.notify.slack.dto.SlackDtos.CreateConversationResponse;
import no.nav.data.common.notify.slack.dto.SlackDtos.PostMessageRequest;
import no.nav.data.common.notify.slack.dto.SlackDtos.PostMessageRequest.Block;
import no.nav.data.common.notify.slack.dto.SlackDtos.PostMessageResponse;
import no.nav.data.common.notify.slack.dto.SlackDtos.Response;
import no.nav.data.common.notify.slack.dto.SlackDtos.UserResponse;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.web.TraceHeaderRequestInterceptor;
import no.nav.data.team.resource.NomClient;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;

@Service
public class SlackClient {

    private static final String LOOKUP_BY_EMAIL = "/users.lookupByEmail?email={email}";
    private static final String OPEN_CONVERSATION = "/conversations.open";
    private static final String POST_MESSAGE = "/chat.postMessage";

    private final RestTemplate restTemplate;
    private final LoadingCache<String, String> userIdCache;
    private final LoadingCache<String, String> conversationCache;

    public SlackClient(RestTemplateBuilder restTemplateBuilder, SlackProperties properties) {
        restTemplate = restTemplateBuilder
                .additionalInterceptors(TraceHeaderRequestInterceptor.correlationInterceptor())
                .rootUri(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getToken())
                .build();

        this.userIdCache = MetricUtils.register("slackUserIdCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(60))
                        .maximumSize(100).build(this::doGetUserId));
        this.conversationCache = MetricUtils.register("slackConversationCache",
                Caffeine.newBuilder().recordStats()
                        .expireAfterAccess(Duration.ofMinutes(60))
                        .maximumSize(100).build(this::doOpenConversation));
    }

    public String getUserIdByIdent(String ident) {
        var email = NomClient.getInstance().getByNavIdent(ident).orElseThrow().getEmail();
        return getUserIdByEmail(email);
    }

    public String getUserIdByEmail(String email) {
        return userIdCache.get(email);
    }

    public String openConversation(String channelId) {
        return conversationCache.get(channelId);
    }

    private String doGetUserId(String email) {
        var response = restTemplate.getForEntity(LOOKUP_BY_EMAIL, UserResponse.class, email);
        UserResponse user = checkResponse(response);
        return user.getUser().getId();
    }

    public void sendMessage(String email, List<Block> blocks) {
        var userId = getUserIdByEmail(email);
        var channel = openConversation(userId);
        sendMessageToChannel(channel, blocks);
    }

    private void sendMessageToChannel(String channel, List<Block> blockKit) {
        var request = new PostMessageRequest(channel, blockKit);
        var response = restTemplate.postForEntity(POST_MESSAGE, request, PostMessageResponse.class);
        checkResponse(response);
    }

    private String doOpenConversation(String userId) {
        var response = restTemplate.postForEntity(OPEN_CONVERSATION, new CreateConversationRequest(userId), CreateConversationResponse.class);
        CreateConversationResponse create = checkResponse(response);
        return create.getChannel().getId();
    }

    @SuppressWarnings("unchecked")
    private <T> T checkResponse(ResponseEntity<? extends Response> response) {
        Assert.notNull(response.getBody(), "empty body");
        Assert.isTrue(response.getBody().isOk(), "Not ok error: " + response.getBody().getError());
        return (T) response.getBody();
    }
}
