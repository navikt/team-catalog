import { css } from "@emotion/css"
import { BodyShort } from "@navikt/ds-react";
import { Fragment } from "react"
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { getResourceUnitsById } from "../../api";
import type { Resource, ResourceUnit, ResourceUnits } from "../../constants";
import { agressoIdDataToUrl } from "../../util/orgurls"
import { linkWithUnderline } from "../../util/styles"
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import { TextWithLabel } from "../TextWithLabel";


type ResourceOrgAffiliationProperties = {
  resource: Resource;
  units?: ResourceUnits;
};

const ResourceOrgAffiliation = ({ resource }: ResourceOrgAffiliationProperties) => {
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
              {units.map((unit: ResourceUnit) => (
                  <div className={css`border-left: 3px solid #E6F1F8; margin-bottom: 1rem; padding-left: 1rem;`}>
                      <TextWithLabel label="Ansatt i" text={<Link to={`/org/${agressoIdDataToUrl(unit.id, unit.niva || '')}`} className={linkWithUnderline}>{unit.name}</Link>} />
                      <TextWithLabel
                          label="Avdeling"
                          text={<Link to={`/org/${agressoIdDataToUrl(unit.parentUnit?.id || '', unit.parentUnit?.niva || '')}`} className={linkWithUnderline}>{unit.parentUnit?.name || ''}</Link>}
                      />
                      <TextWithLabel
                          label="Leder"
                          text={<Link to={`/resource/${unit.leader?.navIdent}`} className={linkWithUnderline}>{unit.leader?.fullName}</Link>}
                      />
                  </div>
              ))}
          </Fragment>
      )}
    </ResourceInfoContainer>
  );
};

export default ResourceOrgAffiliation;
