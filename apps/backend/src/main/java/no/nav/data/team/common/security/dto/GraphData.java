package no.nav.data.team.common.security.dto;

import lombok.Value;
import org.springframework.security.core.GrantedAuthority;

import java.util.Set;

@Value
public class GraphData {

    String navIdent;
    Set<GrantedAuthority> grantedAuthorities;
}
