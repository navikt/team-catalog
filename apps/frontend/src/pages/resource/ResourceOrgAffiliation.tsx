import { css } from "@emotion/css";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { BodyShort, HStack } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Link } from "react-router-dom";

import { getResourceUnitsById } from "../../api/resourceApi";
import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { NomOrgLink } from "../../components/NomOrgLink";
import { NomResourceLink } from "../../components/NomResourceLink";
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
      <TextWithLabel
        label="Profilside i NOM"
        text={
          <NomResourceLink
            navIdent={resource.navIdent}
            tekst={resource.fullName}
            title={"Lenke til den ansattes profilside i NOM"}
          />
        }
      />

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
                text={<NomOrgLink nomId={unit.nomid} tekst={unit.name} title={"Lenke til den ansattes enhet i NOM"} />}
              />

              {unit.parentUnit && (
                <TextWithLabel
                  label="Avdeling"
                  text={
                    <NomOrgLink
                      nomId={unit.parentUnit.nomid}
                      tekst={unit.parentUnit.name}
                      title={"Lenke til den ansattes avdeling i NOM"}
                    />
                  }
                />
              )}

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
