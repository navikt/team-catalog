import { BodyShort } from "@navikt/ds-react";

import type { Resource, ResourceUnits } from "../../constants";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";

type ResourceOrgAffiliationProperties = {
  resource: Resource;
  units?: ResourceUnits;
};

const ResourceOrgAffiliation = (properties: ResourceOrgAffiliationProperties) => {
  const { units } = properties;

  return (
    <ResourceInfoContainer title="Organisatorisk tilhørighet">
      {!units?.units && <BodyShort>Personen har ingen organisatorisk tilhørighet</BodyShort>}
      {(units?.units.length ?? 0) > 0 && (
        <div>
          {/* <TextWithLabel label='Ansatt i' text={<Link to={`/org/${agressoIdDataToUrl(u.id, u.niva || '')}`}>{u.name}</Link>} /> */}
        </div>
      )}
    </ResourceInfoContainer>
  );
};

export default ResourceOrgAffiliation;
