package no.nav.data.team.shared;

import lombok.experimental.UtilityClass;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.TeamRole;

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

    public static String objectType(Class<? extends Membered> type) {
        if (type.equals(ProductArea.class)) {
            return PRODUCT_AREA;
        }
        return TypeRegistration.typeOf(type);
    }
}
