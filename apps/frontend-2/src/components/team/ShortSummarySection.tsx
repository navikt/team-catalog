import { css } from "@emotion/css";
import React, { Fragment, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { getAllClusters } from "../../api/clusterApi";
import { getResourceById, getResourceUnitsById } from "../../api/resourceApi";
import type { ContactAddress, ProductArea, ProductTeam, Resource } from "../../constants";
import { AreaType, Status } from "../../constants";
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
        <span
          className={css`
            margin-right: 0.5em;
          `}
          key={naisTeam}
        >
          {naisTeam}
          {index + 1 < properties.naisTeams.length ? ", " : ""}
        </span>
      ))}
    </div>
  );
};

function TeamOwnerResource(properties: { resource: Resource }) {
  const [departmentInfo, setDepartmentInfo] = React.useState<string>("(loading)");
  const response = properties.resource;

  React.useEffect(() => {
    getResourceUnitsById(response.navIdent)
      .then((it) => {
        const newTxt: string = it?.units[0]?.parentUnit?.name ?? "";
        setDepartmentInfo("(" + newTxt + ")");
      })
      .catch((error) => {
        console.error(error.message);
        setDepartmentInfo("(fant ikke avdeling)");
      });
  }, [response.navIdent]);

  return (
    <div
      className={css`
        margin-bottom: 8px;
      `}
    >
      <div
        className={css`
          display: inline;
        `}
      >
        <Link to={`/resource/${response.navIdent}`}>{response.fullName}</Link>
        <div
          className={css`
            margin-left: 10px;
            display: inline;
          `}
        >
          {departmentInfo}
        </div>
      </div>
    </div>
  );
}

function TeamOwner(properties: { teamOwner?: Resource; area?: ProductArea }) {
  // ID'en til "Ikke plassert i produkt- eller IT-område" i prod er eeb5dc96-3a6f-4d21-9248-2cb7acedd57b
  if (!properties.teamOwner || properties.area?.id != "eeb5dc96-3a6f-4d21-9248-2cb7acedd57b") return <Fragment />;

  const teamOwner = properties.teamOwner;

  return (
    <>
      <TextWithLabel label="Teameier" text={teamOwner ? <TeamOwnerResource resource={teamOwner} /> : "Ingen eier"} />
    </>
  );
}

export const ShortSummarySection = (properties: ShortSummaryProperties) => {
  const { team, productArea } = properties;

  const [teamOwnerResource, setTeamOwnerResource] = useState<Resource>();

  const clustersQuery = useQuery({
    queryKey: "getAllClusters",
    queryFn: () => getAllClusters({ status: Status.ACTIVE }),
    select: (data) => data.content.filter((cluster) => team.clusterIds.includes(cluster.id)),
  });

  const clusters = clustersQuery.data ?? [];

  useEffect(() => {
    (async () => {
      if (team.teamOwnerIdent) {
        setTeamOwnerResource(await getResourceById(team.teamOwnerIdent));
      } else {
        setTeamOwnerResource(undefined);
      }
    })();
  }, [team]);

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

      {productArea && productArea.areaType === AreaType.OTHER && (
        <TeamOwner area={productArea} teamOwner={teamOwnerResource} />
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
