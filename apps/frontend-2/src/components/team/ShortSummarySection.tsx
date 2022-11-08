import { css } from "@emotion/css";
import { BodyShort } from "@navikt/ds-react";
import React from "react";
import { Link } from "react-router-dom";

import type { Cluster, ContactAddress, ProductArea, ProductTeam } from "../../constants";
import { intl } from "../../util/intl/intl";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import { DisplayTags } from "../common/Tags";
import { TextWithLabel } from "../TextWithLabel";

interface ShortSummaryProperties {
  team: ProductTeam;
  productArea?: ProductArea;
  clusters: Cluster[];
  contactAddresses?: ContactAddress[];
}

const DisplayNaisTeams = (properties: { naisTeams: string[] }) => {
  if (properties.naisTeams.length <= 0) return <BodyShort>Ingen naisteams</BodyShort>;
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
      `}
    >
      {properties.naisTeams.map((n: string, index: number) => (
        <BodyShort key={n}>
          {n} {index + 1 < properties.naisTeams.length ? ", " : ""}
        </BodyShort>
      ))}
    </div>
  );
};

const ShortSummarySection = (properties: ShortSummaryProperties) => {
  const { team, productArea, clusters } = properties;

  return (
    <ResourceInfoContainer title="Kort fortalt">
      {productArea && (
        <TextWithLabel label="Område" text={<Link to={`/area/${productArea.id}`}>{productArea.name}</Link>} />
      )}

      {clusters.length > 0 && (
        <TextWithLabel
          label="Klynger"
          text={clusters.map((c, index) => (
            <React.Fragment key={c.id + index}>
              <Link to={`/cluster/${c.id}`}>{c.name}</Link>
              {index < clusters.length - 1 && <span>, </span>}
            </React.Fragment>
          ))}
        />
      )}

      <TextWithLabel label="Teamtype" text={team.teamType ? intl.getString(team.teamType) : intl.dataIsMissing} />
      <TextWithLabel
        label="Eierskap og finansiering"
        text={team.teamOwnershipType ? intl.getString(team.teamOwnershipType) : intl.dataIsMissing}
      />
      <TextWithLabel label="Team på NAIS" text={<DisplayNaisTeams naisTeams={team.naisTeams} />} />
      <TextWithLabel label="Tagg" text={<DisplayTags tags={team.tags} />} />
    </ResourceInfoContainer>
  );
};

export default ShortSummarySection;
