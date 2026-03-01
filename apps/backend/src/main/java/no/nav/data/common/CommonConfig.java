package no.nav.data.common;

import io.micrometer.core.aop.CountedAspect;
import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import io.prometheus.client.CollectorRegistry;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import no.nav.data.common.web.TraceHeaderRequestInterceptor;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Profile;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.json.JsonMapper;

import javax.sql.DataSource;

import static java.util.Collections.emptyList;

@Slf4j
@Configuration
@EnableAspectJAutoProxy
public class CommonConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .additionalInterceptors(TraceHeaderRequestInterceptor.fullInterceptor())
                .build();
    }

    @Bean
    @Profile("!test & !local")
    public RestTemplate externalRestTemplate(RestTemplateBuilder builder) {
        return builder
                .additionalInterceptors(TraceHeaderRequestInterceptor.correlationInterceptor())
                .build();
    }

    @Bean
    public JacksonJsonHttpMessageConverter mappingJackson2HttpMessageConverter(JsonMapper jsonMapper) {
        return new JacksonJsonHttpMessageConverter(jsonMapper);
    }

    /**
     * Make sure spring uses the defaultRegistry
     */
    @Bean
    public CollectorRegistry collectorRegistry() {
        return CollectorRegistry.defaultRegistry;
    }

    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(JdbcTemplateLockProvider.Configuration.builder()
                .withJdbcTemplate(new JdbcTemplate(dataSource))
                .usingDbTime()
                .build());
    }

    @Bean
    TimedAspect timedAspect(MeterRegistry meterRegistry) {
        return new TimedAspect(meterRegistry,
                proceedingJoinPoint -> emptyList(),
                proceedingJoinPoint -> false
        );
    }

    @Bean
    CountedAspect countedAspect(MeterRegistry meterRegistry) {
        return new CountedAspect(meterRegistry,
                proceedingJoinPoint -> emptyList(),
                proceedingJoinPoint -> false
        );
    }
}
