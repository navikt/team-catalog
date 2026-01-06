package no.nav.data.common.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.common.utils.Constants;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Optional;

@Slf4j
@Configuration
public class MetricsConfiguration implements WebMvcConfigurer {

    private final EndpointMetricInterceptor endpointMetricInterceptor;

    public MetricsConfiguration(MeterRegistry meterRegistry, SecurityUtils securityUtils){
        log.info("Setup endpoint metrics");
        this.endpointMetricInterceptor = new EndpointMetricInterceptor(meterRegistry, securityUtils);
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(endpointMetricInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/internal/**");
    }

    private static class EndpointMetricInterceptor implements HandlerInterceptor {

        private final MeterRegistry meterRegistry;
        private final SecurityUtils securityUtils;

        public EndpointMetricInterceptor(MeterRegistry meterRegistry, SecurityUtils securityUtils){
            this.meterRegistry = meterRegistry;
            this.securityUtils = securityUtils;
        }

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            var bestMatchingPattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
            var maybeAppName = securityUtils.getCurrentUser().map(UserInfo::getAppName).map(it -> "app=" + it);
            var maybeConsumerHeader = Optional.ofNullable(request.getHeader(Constants.HEADER_CONSUMER_ID)).map(it -> "consumer=" + it);
            var identifier = maybeAppName.orElse(maybeConsumerHeader.orElse("UNKNOWN_CONSUMER"));
            Counter.builder("endpoint.hit").tags("uri", bestMatchingPattern, "identifier", identifier).register(meterRegistry).increment();
            return true;
        }
    }
}


