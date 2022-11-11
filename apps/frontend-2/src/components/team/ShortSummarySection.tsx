import { css } from "@emotion/css";
import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { getAllClusters } from "../../api/clusterApi";
import type { ContactAddress, ProductArea, ProductTeam } from "../../constants";
import { Status } from "../../constants";
import { intl } from "../../util/intl/intl";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import { Tags } from "../common/Tags";
import { TextWithLabel } from "../TextWithLabel";

interface ShortSummaryProperties {
  team: ProductTeam;
  productArea?: ProductArea;
  contactAddresses: ContactAddress[];
}

const DisplayNaisTeams = (properties: { naisTeams: string[] }) => {
  if (properties.naisTeams.length <= 0) return <span>Ingen naisteams</span>;
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
      `}
    >
      {properties.naisTeams.map((naisTeam: string, index: number) => (
        <span key={naisTeam}>
          {naisTeam} {index + 1 < properties.naisTeams.length ? ", " : ""}
        </span>
      ))}
    </div>
  );
};

const ShortSummarySection = (properties: ShortSummaryProperties) => {
  const { team, productArea } = properties;

  const clustersQuery = useQuery({
    queryKey: "getAllClusters",
    queryFn: () => getAllClusters({ status: Status.ACTIVE }),
    select: (data) => data.content.filter((cluster) => team.clusterIds.includes(cluster.id)),
  });

  const clusters = clustersQuery.data ?? [];

  return (
    <ResourceInfoContainer title="Kort fortalt">
      {productArea && (
        <TextWithLabel label="Område" text={<Link to={`/area/${productArea.id}`}>{productArea.name}</Link>} />
      )}

      {clusters.length > 0 && (
        <TextWithLabel
          label="Klynger"
          text={clusters.map((cluster, index) => (
            <React.Fragment key={cluster.id + index}>
              <Link to={`/cluster/${cluster.id}`}>{cluster.name}</Link>
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
      <TextWithLabel label="Tagg" text={<Tags tags={team.tags} />} />
    </ResourceInfoContainer>
  );
};

export default ShortSummarySection;
