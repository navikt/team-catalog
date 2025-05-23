package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.UtilityClass;
import no.nav.nom.graphql.model.OrgEnhetDto;
import no.nav.nom.graphql.model.RessursDto;
import no.nav.nom.graphql.model.ResultCodeDto;

import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.toMap;


@UtilityClass
public class NomGraphQlResponse {

    @Data
    public static class SingleRessurs {

        private DataWrapper data;
        private ArrayNode errors;

        @Data
        public static class DataWrapper {

            RessursDto ressurs;

        }

    }

    @Data
    public static class SingleOrg {

        private DataWrapper data;
        private ArrayNode errors;

        @Data
        public static class DataWrapper {

            OrgEnhetDto orgEnhet;

        }

    }

    @Data
    public static class MultiRessurs {

        private DataWrapper data;
        private ArrayNode errors;

        @Data
        public static class DataWrapper {

            List<RessursWrapper> ressurser;

            public Map<String, RessursDto> getRessurserAsMap() {
                return ressurser.stream()
                        .filter(r -> r.getRessurs() != null)
                        .collect(toMap(RessursWrapper::getId, RessursWrapper::getRessurs));
            }

            @Data
            @Builder
            @AllArgsConstructor
            @NoArgsConstructor
            public static class RessursWrapper {

                String id;
                ResultCodeDto code;
                RessursDto ressurs;

            }
        }

    }

    @Data
    public static class MultiOrg {

        private DataWrapper data;
        private ArrayNode errors;

        @Data
        public static class DataWrapper {

            List<OrgEnhetWrapper> orgEnheter;

            public Map<String, OrgEnhetDto> getOrgEnheterAsMap() {
                return orgEnheter.stream()
                        .filter(r -> r.getOrgEnhet() != null)
                        .collect(toMap(OrgEnhetWrapper::getId, OrgEnhetWrapper::getOrgEnhet));
            }

            @Data
            @Builder
            @AllArgsConstructor
            @NoArgsConstructor
            public static class OrgEnhetWrapper {

                String id;
                ResultCodeDto code;
                OrgEnhetDto orgEnhet;

            }
        }

    }

}
