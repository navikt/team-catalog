import { BodyShort } from "@navikt/ds-react";
import { useQuery } from "react-query";

import { getResourceUnitsById } from "../../api";
import type { Resource } from "../../constants";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";

type ResourceOrgAffiliationProperties = {
  resource: Resource;
};

const ResourceOrgAffiliation = ({ resource }: ResourceOrgAffiliationProperties) => {
  const fetchResourceUnitsQuery = useQuery({
    queryKey: ["getResourceUnitsById", resource.navIdent],
    queryFn: () => getResourceUnitsById(resource.navIdent),
  });

  const units = fetchResourceUnitsQuery.data?.units ?? [];

  return (
    <ResourceInfoContainer title="Organisatorisk tilhørighet">
      {(units.length ?? 0) === 0 && <BodyShort>Personen har ingen organisatorisk tilhørighet</BodyShort>}
      {(units.length ?? 0) > 0 && (
        <div>
          Under arbeid
          {/* <TextWithLabel label='Ansatt i' text={<Link to={`/org/${agressoIdDataToUrl(u.id, u.niva || '')}`}>{u.name}</Link>} /> */}
        </div>
      )}
    </ResourceInfoContainer>
  );
};

export default ResourceOrgAffiliation;
