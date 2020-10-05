package no.nav.data.team.shared;

import lombok.experimental.UtilityClass;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;

@UtilityClass
public class Lang {

    public static String MEMBERS = "Medlemmer";
    public static String RELATION = "Tilknyttning";
    public static String PRODUCT_AREA = "Område";
    public static String TEAM = "Team";
    public static String IDENT = "Ident";
    public static String GIVEN_NAME = "Fornavn";
    public static String FAMILY_NAME = "Etternavn";
    public static String TYPE = "Type";
    public static String ROLES = "Roller";
    public static String OTHER = "Annet";
    public static String EMAIL = "Epost";
    public static String START_DATE = "Startdato";
    public static String END_DATE = "Sluttdato";

    public static String NAME = "Navn";
    public static String TEAM_LEADS = "Teamledere";
    public static String PRODUCT_OWNERS = "Produkteiere";
    public static String QA_DONE = "Kvalitetssikret";
    public static String NAIS_TEAMS = "Nais teams";
    public static String TAGS = "Tags";
    public static String INTERNAL = "Interne";
    public static String EXTERNAL = "Eksterne";
    public static String SLACK = "Slack";
    public static String DESCRIPTION = "Beskrivelse";

    public static String roleName(TeamRole role) {
        return switch (role) {
            case LEAD -> "Teamleder";
            case DEVELOPER -> "Utvikler";
            case TESTER -> "Tester";
            case TECH_LEAD -> "Tech lead";
            case TEST_LEAD -> "Testleder";
            case PRODUCT_OWNER -> "Produkteier";
            case SECURITY_ARCHITECT -> "Sikkerhetsarkitekt";
            case SOLUTION_ARCHITECT -> "Løsningsarkitetkt";
            case BUSINESS_ANALYST -> "Forretningsutvikler";
            case DOMAIN_EXPERT -> "Domeneekspert";
            case DOMAIN_RESPONSIBLE -> "Fagansvarlig";
            case DOMAIN_RESOURCE -> "Fagressurs";
            case ARCHITECT -> "Arkitekt";
            case AGILE_COACH -> "Agile coach";
            case DATA_MANAGER -> "Data manager";
            case DATA_SCIENTIST -> "Data scientist";
            case MAINTENANCE_MANAGER -> "Vedlikeholdsansvarlig";
            case DESIGNER -> "Designer";
            case OPERATIONS -> "Drift";
            case FUNCTIONAL_ADVISER -> "Funksjonell rådgiver";
            case TECHNICAL_ADVISER -> "Teknisk rådgiver";
            case TECHNICAL_TESTER -> "Teknisk tester";
            case OTHER -> "Annet";
        };
    }

    public static String memberType(ResourceType resourceType) {
        return switch (resourceType) {
            case INTERNAL -> "Intern";
            case EXTERNAL -> "Ekstern";
            case OTHER -> "Annet";
        };
    }

    public static String teamType(TeamType teamType) {
        if (teamType == null) {
            return "";
        }
        return switch (teamType) {
            case IT -> "IT-team";
            case PRODUCT -> "Produktteam";
            case ADMINISTRATION -> "Forvaltningsteam";
            case PROJECT -> "Prosjektteam";
            case OTHER -> "Annet";
            case UNKNOWN -> "Ukjent";
        };
    }

    public static String areaType(AreaType type) {
        if (type == null) {
            return "";
        }
        return switch (type) {
            case IT -> "IT-område";
            case PRODUCT_AREA -> "Produktområde";
            case PROJECT -> "Prosjekt";
            case OTHER -> "Annet";
        };
    }

    public static String objectType(Class<? extends Membered> type) {
        if (type.equals(ProductArea.class)) {
            return PRODUCT_AREA;
        }
        return TypeRegistration.typeOf(type);
    }
}
