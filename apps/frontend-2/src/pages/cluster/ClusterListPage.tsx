import { css } from "@emotion/css";
import { Add } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import React from "react";
import { useQuery } from "react-query";

import { getAllClusters } from "../../api/clusterApi";
import { useDash } from "../../components/dash/Dashboard";
import PageTitle from "../../components/PageTitle";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import ClusterCardList from "./ClusterCardList";

const ClusterListPage = () => {
  const user = useUser();
  const dash = useDash();
  const [status, setStatus] = React.useState<string>("active");

  const clusterQuery = useQuery({
    queryKey: ["getAllClusters", status],
    queryFn: () => getAllClusters(status as string),
    select: (data) => data.content,
  });

  const clusters = clusterQuery.data ?? [];

  return (
    <React.Fragment>
      <div
        className={css`
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        `}
      >
        <PageTitle title="Klynger" />

        <div
          className={css`
            display: flex;
            align-items: end;
            flex-wrap: wrap;
          `}
        >
          <ToggleGroup
            className={css`
              margin-right: 1rem;
            `}
            onChange={(value) => setStatus(value)}
            size="medium"
            value={status}
          >
            <ToggleGroup.Item value="active">Aktive ({dash?.clusterCount})</ToggleGroup.Item>
            <ToggleGroup.Item value="planned">Fremtidige ({dash?.clusterCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value="inactive">Inaktive ({dash?.clusterCountInactive})</ToggleGroup.Item>
          </ToggleGroup>

          {userHasGroup(user, Group.WRITE) && (
            <Button
              className={css`
                margin-left: 1rem;
              `}
              icon={<Add />}
              size="medium"
              variant="secondary"
            >
              Opprett nytt klynge
            </Button>
          )}
        </div>
      </div>
      {clusters.length > 0 && <ClusterCardList clusterList={clusters} />}
    </React.Fragment>
  );
};

export default ClusterListPage;
