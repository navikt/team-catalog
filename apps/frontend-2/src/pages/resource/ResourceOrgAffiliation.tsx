import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import { Fragment } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { getResourceUnitsById } from "../../api/resourceApi";
import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { Resource, ResourceUnits } from "../../constants";
import { agressoIdDataToUrl } from "../../util/orgurls";
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
  console.log(units);
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
                    to={`https://nom.nav.no/org/${unit.nomid}`}
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
                    to={`/org/${agressoIdDataToUrl(unit.parentUnit?.id || "", unit.parentUnit?.niva || "")}`}
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
