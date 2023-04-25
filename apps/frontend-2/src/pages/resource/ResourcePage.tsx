import { css } from "@emotion/css";
import { Alert, Heading, Loader, Tag } from "@navikt/ds-react";
import { isAfter } from "date-fns";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllMemberships, getResourceById } from "../../api";
import { UserBadges } from "../../components/common/UserBadges";
import { UserImage } from "../../components/UserImage";
import { ResourceType, Status } from "../../constants";
import { ResourceAffiliation } from "./ResourceAffiliation";
import { ResourceIsLeaderForTable } from "./ResourceIsLeaderForTable";
import { ResourceOrgAffiliation } from "./ResourceOrgAffiliation";
import { ShortSummaryResource } from "./ShortSummaryResource";

export const ResourcePage = () => {
  const { navIdent } = useParams<{ navIdent: string }>();

  const fetchResourceQuery = useQuery({
    queryKey: ["getResourceById", navIdent],
    queryFn: () => getResourceById(navIdent),
  });

  const fetchMemberships = useQuery({
    queryKey: ["getAllMemberships", navIdent],
    queryFn: () => getAllMemberships(navIdent as string),
    enabled: !!navIdent,
  });

  const filteredTeams = (fetchMemberships.data?.teams ?? []).filter((team) => team.status == Status.ACTIVE);
  const filteredClusters = (fetchMemberships.data?.clusters ?? []).filter((cluster) => cluster.status == Status.ACTIVE);
  const filteredAreas = (fetchMemberships.data?.productAreas ?? []).filter((area) => area.status == Status.ACTIVE);

  const resource = fetchResourceQuery.data;
  const memberships = fetchMemberships.data;

  if (fetchResourceQuery.isLoading) {
    return <Loader />;
  }

  if (!resource) {
    return <Alert variant="info">Fant ikke ressurs</Alert>;
  }

  return (
    <>
      <div
        className={css`
          display: flex;
          gap: 1rem;
          align-items: center;
        `}
      >
        <UserImage navIdent={resource.navIdent} size="100px" />
        <Heading level="1" size="large">
          {`${resource.fullName} ${resource.resourceType === ResourceType.EXTERNAL ? "(Ekstern)" : ""}`}
        </Heading>
        {memberships && <UserBadges memberships={memberships} resource={resource} />}
        {resource.endDate && isAfter(new Date(), new Date(resource.endDate)) && <Tag variant="warning">Sluttet</Tag>}
      </div>

      <div
        className={css`
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-column-gap: 3rem;
          margin-top: 2rem;
        `}
      >
        <ShortSummaryResource resource={resource} />
        <ResourceAffiliation
          clusters={filteredClusters}
          productAreas={filteredAreas}
          resource={resource}
          teams={filteredTeams}
        />
        <ResourceOrgAffiliation resource={resource} />
      </div>
      <ResourceIsLeaderForTable resource={resource} />
    </>
  );
};
