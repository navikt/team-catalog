package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.Data;
import lombok.experimental.UtilityClass;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.nom.graphql.model.RessursDto;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import static java.util.stream.Collectors.toMap;


@UtilityClass
public class NomGraphQlRessurs {

    @Data
    public static class Single {

        private Ressurser data;
        private ArrayNode errors;

        @Data
        public class Ressurser {

            List<RessursDto> ressurs;

            public RessursDto get() {
                checkErrors(errors);
                return ressurs.isEmpty() ? null : ressurs.get(0);
            }
        }

    }

    @Data
    public static class Mapped {

        private Map<String, List<RessursDto>> data;
        private ArrayNode errors;

        public Map<String, RessursDto> toSingleResultMap() {
            checkErrors(errors);
            return data.entrySet().stream()
                    .filter(e -> !e.getValue().isEmpty())
                    .collect(toMap(Entry::getKey, e -> e.getValue().get(0)));
        }

    }

    private static void checkErrors(ArrayNode errors) {
        if (errors != null && !errors.isEmpty()) {
            throw new TechnicalException("GQL error " + errors);
        }
    }

}
