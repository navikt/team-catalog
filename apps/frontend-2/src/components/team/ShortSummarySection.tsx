import { css } from "@emotion/css";
import { BodyShort, Heading } from "@navikt/ds-react";
import React from "react";
import { Link } from "react-router-dom";

import type { Cluster, ContactAddress, ProductArea, ProductTeam } from "../../constants";
import { intl } from "../../util/intl/intl";
import { SmallDivider } from "../Divider";
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

const DisplayTags = (properties: { tags: string[] }) => {
  if (properties.tags.length <= 0) return <BodyShort>Ingen tags</BodyShort>;
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      `}
    >
      {properties.tags.map((t: string, index: number) => (
        <Link key={t} to={"/tag/" + t}>
          {t} {index + 1 < properties.tags.length ? ", " : ""}
        </Link>
      ))}
    </div>
  );
};

const ShortSummarySection = (properties: ShortSummaryProperties) => {
  const { team, productArea, clusters } = properties;

  return (
    <div>
      <Heading level="2" size="medium">
        Kort fortalt
      </Heading>
      <SmallDivider />
      <div
        className={css`
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: var(--navds-spacing-4);
        `}
      >
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
      </div>
    </div>
  );
};

export default ShortSummarySection;
