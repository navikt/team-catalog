package no.nav.data.common.jpa;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
//@ConditionalOnProperty(value = "vault.enabled", matchIfMissing = true)
public class FlywayConfig {

//    @Bean
//    public FlywayConfigurationCustomizer flywayConfigurationCustomizer(VaultConfig vaultConfig, DataSourceProperties properties) {
//        return configuration -> {
//            String adminRole = vaultConfig.getDatabaseAdminrole();
//            String path = vaultConfig.getDatabaseBackend() + "/creds/" + adminRole;
//            log.info("Getting credentials for role {}", adminRole);
//            LogicalResponse response = read(path);
//            String username = response.getData().get("username");
//            String password = response.getData().get("password");
//            log.info("Setting datasource for flyway with user {} and role {}", username, adminRole);
//
//            HikariConfig config = DatasourceConfig.createHikariConfig(properties);
//            config.setUsername(username);
//            config.setPassword(password);
//
//            configuration
//                    .dataSource(new HikariDataSource(config))
//                    .initSql(String.format("SET ROLE \"%s\"", adminRole));
//        };
//    }
//
//    private LogicalResponse read(String path) {
//        try {
//            return VaultUtil.getInstance().getClient().logical().read(path);
//        } catch (Exception e) {
//            throw new TechnicalException("vault error", e);
//        }
//    }
}
