package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.Data;
import lombok.experimental.UtilityClass;
import no.nav.nom.graphql.model.RessursDto;

import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.toMap;


@UtilityClass
public class NomGraphQlRessurs {

    @Data
    public static class Single {

        private DataWrapper data;
        private ArrayNode errors;

        @Data
        public static class DataWrapper {

            RessursDto ressurs;

        }

    }

    @Data
    public static class Multi {

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
            public static class RessursWrapper {

                String id;
                String code;
                RessursDto ressurs;

            }
        }

    }

}
