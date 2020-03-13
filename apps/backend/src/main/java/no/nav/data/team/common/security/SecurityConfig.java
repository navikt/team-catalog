package no.nav.data.team.common.security;

import com.microsoft.aad.msal4j.ClientCredentialFactory;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;
import com.microsoft.aad.msal4j.IConfidentialClientApplication;
import com.microsoft.azure.spring.autoconfigure.aad.AADAuthenticationProperties;
import com.microsoft.azure.spring.autoconfigure.aad.ServiceEndpoints;
import com.microsoft.azure.spring.autoconfigure.aad.ServiceEndpointsProperties;
import com.microsoft.azure.spring.autoconfigure.aad.UserPrincipalManager;
import com.nimbusds.jose.util.ResourceRetriever;
import no.nav.data.team.common.utils.MdcExecutor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.net.MalformedURLException;

import static org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI;

@PropertySource("classpath:/aad-oauth2-common.properties")
@Configuration
public class SecurityConfig {

    @Bean
    public AADStatelessAuthenticationFilter aadStatelessAuthenticationFilter(ResourceRetriever resourceRetriever, AADAuthenticationProperties aadAuthProps,
            ServiceEndpointsProperties serviceEndpointsProps, AzureTokenProvider azureTokenProvider, AppIdMapping appIdMapping) {
        var userPrincipalManager = new UserPrincipalManager(serviceEndpointsProps, aadAuthProps, resourceRetriever, true);
        return new AADStatelessAuthenticationFilter(userPrincipalManager, azureTokenProvider, appIdMapping);
    }

    @Bean
    public IConfidentialClientApplication msalClient(AADAuthenticationProperties aadAuthProps, ServiceEndpoints serviceEndpoints) throws MalformedURLException {
        String uri = serviceEndpoints.getAadSigninUri() + aadAuthProps.getTenantId();
        return ConfidentialClientApplication
                .builder(aadAuthProps.getClientId(), ClientCredentialFactory.create(aadAuthProps.getClientSecret()))
                .authority(uri)
                .executorService(adalExecutorService())
                .build();
    }

    @Bean
    public ServiceEndpoints serviceEndpoints(AADAuthenticationProperties aadAuthProps, ServiceEndpointsProperties serviceEndpointsProps) {
        return serviceEndpointsProps.getServiceEndpoints(aadAuthProps.getEnvironment());
    }

    @Bean
    public MdcExecutor adalExecutorService() {
        return MdcExecutor.newThreadPool(5, "adal");
    }

    @Bean
    public AppIdMapping appIdMapping(SecurityProperties securityProperties) {
        return new AppIdMapping(securityProperties.getAllowedAppIdMappings());
    }

    @Bean
    public OAuth2AuthorizationRequestResolver resolver(ClientRegistrationRepository repository) {
        return new DefaultOAuth2AuthorizationRequestResolver(repository, DEFAULT_AUTHORIZATION_REQUEST_BASE_URI);
    }

    @Bean
    public Encryptor encryptor(SecurityProperties securityProperties) {
        return new Encryptor(securityProperties.getEncKey());
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/login/**")
                        .allowedOrigins("*");
            }
        };
    }
}
