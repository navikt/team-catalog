package no.nav.data.common.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityScheme.Type;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(new Components().addSecuritySchemes("bearer-key",
                        new SecurityScheme().type(Type.HTTP).scheme("bearer").bearerFormat("token")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-key"))
                .info(new Info().title("Team Catalog")
                        .description("Rest API for getting and posting information on teams")
                        .version("v1.0")
                        .license(new License().name("MIT License")))
                .externalDocs(new ExternalDocumentation()
                        .description("Teamkatalog på NADA")
                        .url("https://dataplattform.gitbook.io/nada/kataloger/teamkatalog"));
    }
}
