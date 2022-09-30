package no.nav.data.team.shared;

import lombok.experimental.UtilityClass;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.TeamOwnershipType;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;

@UtilityClass
public class Lang {

    public static final String MEMBERS = "Medlemmer";
    public static final String RELATION = "Tilknyttning";
    public static final String AREA_ID = "Område id";
    public static final String AREA = "Område";
    public static final String CLUSTER = "Klynge";
    public static final String TEAM_ID = "Team id";
    public static final String TEAM = "Team";
    public static final String IDENT = "Ident";
    public static final String GIVEN_NAME = "Fornavn";
    public static final String FAMILY_NAME = "Etternavn";
    public static final String TEAM_TYPE = "Teamtype";
    public static final String OWNERSHIP_TYPE = "Eierskapstype";
    public static final String ROLES = "Roller";
    public static final String OTHER = "Annet";
    public static final String EMAIL = "Epost";
    public static final String START_DATE = "Startdato";
    public static final String END_DATE = "Sluttdato";
    public static final String STATUS = "Status";
    public static final String CONTACT_PERSON = "Kontaktperson";
    public static final String OFFICE_HOURS = "Tilstedeværelse";
    public static final String LOCATION = "Lokasjon";

    public static final String NAME = "Navn";
    public static final String TEAM_LEADS = "Teamledere";
    public static final String PRODUCT_OWNERS = "Produkteiere";
    public static final String QA_DONE = "Kvalitetssikret";
    public static final String NAIS_TEAMS = "Nais team";
    public static final String TAGS = "Tags";
    public static final String INTERNAL = "Interne";
    public static final String EXTERNAL = "Eksterne";
    public static final String SLACK = "Slack";
    public static final String DESCRIPTION = "Beskrivelse";

    public static String roleName(TeamRole role) {
        return switch (role) {
            case LEAD -> "Teamleder";
            case DEVELOPER -> "Utvikler";
            case TESTER -> "Tester";
            case TECH_DOMAIN_SPECIALIST -> "Teknisk domenespesialist";
            case TECH_LEAD -> "Tech lead";
            case TEST_LEAD -> "Testleder";
            case PRODUCT_OWNER -> "Produkteier";
            case PRODUCT_LEAD -> "Produktleder";
            case SECURITY_ARCHITECT -> "Sikkerhetsarkitekt";
            case SOLUTION_ARCHITECT -> "Løsningsarkitekt";
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
            case COMMUNICATION_ADVISER -> "Kommunikasjonsrådgiver";
            case AREA_LEAD -> "Områdeleder";
            case LEGAL_ADVISER -> "Jurist";
            case SECURITY_CHAMPION -> "Security champion";
            case UU_CHAMPION -> "UU champion";
            case PROFIT_COACH -> "Gevinst Coach";
            case DESIGN_RESEARCHER -> "Design researcher";
            case HEAD_OF_LEGAL -> "Head of legal";
            case CONTROLLER -> "Controller";
            case STAFFING_MANAGER -> "Bemanningsansvarlig";
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

    public static String teamOwnershipType(TeamOwnershipType teamOwnershipType) {
        if (teamOwnershipType == null) {
            return "";
        }
        return switch (teamOwnershipType) {
            case IT -> "IT-team";
            case PRODUCT -> "Produktteam";
            case ADMINISTRATION -> "Forvaltningsteam";
            case PROJECT -> "Prosjektteam";
            case OTHER -> "Annet";
            case UNKNOWN -> "Ukjent";
        };
    }

    public static String teamType(TeamType teamType) {
        if (teamType == null) {
            return "";
        }
        return switch (teamType) {
            case STREAM_ALIGNED -> "Verdistrømteam";
            case ENABLING -> "Tilretteleggingsteam";
            case PLATFORM -> "Plattformteam";
            case COMPLICATED_SUBSYSTEM -> "Subsystemteam";
            case WORKGROUP -> "Arbeidsgruppe";
            case MANAGEMENT -> "Ledergruppe";
            case PROJECTGROUP -> "Prosjektgruppe";
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
            return AREA;
        } else if (type.equals(Cluster.class)) {
            return CLUSTER;
        }
        return TypeRegistration.typeOf(type);
    }
}
