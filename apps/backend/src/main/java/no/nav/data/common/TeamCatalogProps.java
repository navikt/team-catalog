package no.nav.data.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ConfigurationProperties(prefix = "team-catalog")
public class TeamCatalogProps {

    private String envlevel;

    /**
     * returns true for main catalog, false for sandbox env (nais yaml wont accept bools, not even 'string-bools')
     */
    public boolean isPrimary() {
        return envlevel.equals("primary");
    }
}
