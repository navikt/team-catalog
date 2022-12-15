import { css } from "@emotion/css";
import { Alert, Loader } from "@navikt/ds-react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllMemberships, getResourceById } from "../api";
import { PageHeader } from "../components/PageHeader";
import ResourceAffiliation from "../components/Resource/ResourceAffiliation";
import ResourceOrgAffiliation from "../components/Resource/ResourceOrgAffiliation";
import ShortSummaryResource from "../components/Resource/ShortSummaryResource";
import { UserImage } from "../components/UserImage";
import { Status } from "../constants";

const ResourcePage = () => {
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
          width: 100%;
          align-items: center;
        `}
      >
        <div
          className={css`
            margin-right: 1rem;
          `}
        >
          <UserImage resource={resource} size="100px" />
        </div>
        <PageHeader title={resource.fullName} />
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
    </>
  );
};

export default ResourcePage;
