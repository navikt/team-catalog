import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Link } from "react-router-dom";

import { getResourceUnitsById } from "../../api/resourceApi";
import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { Resource, ResourceUnits } from "../../constants";
import { env } from "../../util/env";
import { linkWithUnderline } from "../../util/styles";

type ResourceOrgAffiliationProperties = {
  resource: Resource;
  units?: ResourceUnits;
};

export const ResourceOrgAffiliation = ({ resource }: ResourceOrgAffiliationProperties) => {
  const fetchResourceUnitsQuery = useQuery({
    queryKey: ["getResourceUnitsById", resource.navIdent],
    queryFn: () => getResourceUnitsById(resource.navIdent),
  });

  const units = fetchResourceUnitsQuery.data?.units ?? [];
  return (
    <ResourceInfoContainer title="Organisatorisk tilhørighet">
      {(units.length ?? 0) === 0 && <BodyShort>Ingen organisatorisk tilhørighet</BodyShort>}
      {(units.length ?? 0) > 0 && (
        <Fragment>
          {units.map((unit) => (
            <div
              className={css`
                display: flex;
                flex-direction: column;
                gap: 1rem;
              `}
              key={unit.id}
            >
              <TextWithLabel
                label="Ansatt i"
                text={
                  <Link
                    className={linkWithUnderline}
                    rel="noopener noreferrer"
                    target="_blank"
                    to={
                      env.isDev
                        ? `https://nom.ekstern.dev.nav.no/org/${unit.nomid}`
                        : `https://nom.nav.no/org/${unit.nomid}`
                    }
                  >
                    {unit.name}
                  </Link>
                }
              />
              <TextWithLabel
                label="Avdeling"
                text={
                  <Link
                    className={linkWithUnderline}
                    rel="noopener noreferrer"
                    target="_blank"
                    to={
                      env.isDev
                        ? `https://nom.ekstern.dev.nav.no/org/${unit.parentUnit?.nomid}`
                        : `https://nom.nav.no/org/${unit.parentUnit?.nomid}`
                    }
                  >
                    {unit.parentUnit?.name || ""}
                  </Link>
                }
              />
              <TextWithLabel
                label="Leder"
                text={
                  <Link className={linkWithUnderline} to={`/resource/${unit.leader?.navIdent}`}>
                    {unit.leader?.fullName}
                  </Link>
                }
              />
            </div>
          ))}
        </Fragment>
      )}
    </ResourceInfoContainer>
  );
};
