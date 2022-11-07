import { BodyShort, Heading } from "@navikt/ds-react";

import type { Resource, ResourceUnits } from "../../constants";
import { SmallDivider } from "../Divider";

type ResourceOrgAffiliationProperties = {
  resource: Resource;
  units?: ResourceUnits;
};

const ResourceOrgAffiliation = (properties: ResourceOrgAffiliationProperties) => {
  const { units } = properties;

  return (
    <div>
      <Heading size="medium">Organisatorisk tilhørighet</Heading>
      <SmallDivider />
      {!units?.units && <BodyShort>Personen har ingen organisatorisk tilhørighet</BodyShort>}
      {units && units.units.length > 0 && (
        <div>
          {/* <TextWithLabel label='Ansatt i' text={<Link to={`/org/${agressoIdDataToUrl(u.id, u.niva || '')}`}>{u.name}</Link>} /> */}
        </div>
      )}
    </div>
  );
};

export default ResourceOrgAffiliation;
