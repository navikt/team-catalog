package no.nav.data.common.security;

import no.nav.data.common.security.azure.AADStatelessAuthenticationFilter;
import no.nav.data.common.security.dto.AppRole;
import no.nav.data.common.web.UserFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true)
public class WebSecurityConfig {

    private final UserFilter userFilter = new UserFilter();

    private final AADStatelessAuthenticationFilter aadAuthFilter;

    public WebSecurityConfig(AADStatelessAuthenticationFilter aadAuthFilter) {
        this.aadAuthFilter = aadAuthFilter;
    }

    @Bean
    @Profile("test")
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement((sessionManagement) ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        addFilters(httpSecurity);

        return httpSecurity.build();
    }

    @Bean
    @Profile("!test")
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement((sessionManagement) ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers(allowAllEndpoints()).permitAll()
                        .requestMatchers(HttpMethod.GET, getAndOptionsEndpoints()).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, getAndOptionsEndpoints()).permitAll()
                        .requestMatchers(adminOnlyEndpoints()).hasRole(AppRole.ADMIN.name())
                        .requestMatchers(HttpMethod.POST, "/resource/multi").permitAll()
                        .requestMatchers("/logout").authenticated()
                        .requestMatchers("/**").hasRole(AppRole.WRITE.name())
                );

        addFilters(httpSecurity);

        return httpSecurity.build();
    }

    String[] allowAllEndpoints() {
        return new String[]{
                "/login",
                "/oauth2/callback",
                "/userinfo",
                "/internal/**",
                "/swagger*/**"
        };
    }

    String[] getAndOptionsEndpoints() {
        return new String[]{
                "/team/**",
                "/productarea/**",
                "/cluster/**",
                "/naisteam/**",
                "/resource/**",
                "/org/**",
                "/location/**",
                "/locationTwo/**",
                "/member/**",
                "/tag/**",
                "/contactaddress/**",
                "/dash/**",
                "/settings/**",
                "/notification/**",
                "/integration/pcat/**"
        };
    }

    String[] adminOnlyEndpoints() {
        return new String[]{
                "/audit/**",
                "/settings/**",
                "/admin/**",
                "/location/**"
        };
    }

    private void addFilters(HttpSecurity http) {
        // In lightweight mvc tests where authfilter isn't initialized
        if (aadAuthFilter != null) {
            http.addFilterBefore(aadAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }
        http.addFilterAfter(userFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
