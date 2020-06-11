package no.nav.data.team.common.swagger;

import com.google.common.base.Predicates;
import io.swagger.models.auth.In;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import springfox.documentation.builders.AuthorizationScopeBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ApiKey;
import springfox.documentation.service.AuthorizationScope;
import springfox.documentation.service.Contact;
import springfox.documentation.service.SecurityReference;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.Collections;
import java.util.List;

import static springfox.documentation.builders.RequestHandlerSelectors.basePackage;

@Configuration
@EnableSwagger2
public class SwaggerConfig {

    public static final String JSON = "java.lang.String";
    public static final String LOCAL_DATE = "java.sql.Date";
    public static final String BOOLEAN = "java.lang.Boolean";

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(Predicates.or(
                        basePackage("no.nav.data.team.common.security"),
                        basePackage("no.nav.data.team.common.audit"),
                        basePackage("no.nav.data.team.settings"),
                        basePackage("no.nav.data.team.dashboard"),
                        basePackage("no.nav.data.team.po"),
                        basePackage("no.nav.data.team.team"),
                        basePackage("no.nav.data.team.naisteam"),
                        basePackage("no.nav.data.team.resource"),
                        basePackage("no.nav.data.team.member"),
                        basePackage("no.nav.data.team.tag")
                ))
                .paths(PathSelectors.any())
                .build()
                .securitySchemes(Collections.singletonList(new ApiKey("Token Access", HttpHeaders.AUTHORIZATION, In.HEADER.name())))
                .securityContexts(List.of(SecurityContext.builder().securityReferences(tokenAccess()).forPaths(PathSelectors.any()).build()))
                .apiInfo(apiInfo());
    }

    private List<SecurityReference> tokenAccess() {
        return List.of(SecurityReference.builder()
                .reference("Token Access")
                .scopes(new AuthorizationScope[]{
                        new AuthorizationScopeBuilder().scope("global").build()
                }).build());
    }

    private ApiInfo apiInfo() {
        return new ApiInfo(
                "Team Catalog",
                "Rest API for getting and posting information on teams",
                "1.0",
                "Terms of service",
                new Contact("NAV", "www.nav.no", "post@nav.no"),
                "License of API", "API license URL", Collections.emptyList());
    }
}
