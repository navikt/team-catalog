import { css } from "@emotion/css";
import { Add } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import React, { useEffect } from "react";

import { createCluster, getAllClusters } from "../../api/clusterApi";
import { useDash } from "../../components/dash/Dashboard";
import PageTitle from "../../components/PageTitle";
import type { Cluster, ClusterFormValues, ProductArea, ProductAreaFormValues } from "../../constants";
import { user } from "../../services/User";
import ClusterCardList from "./ClusterCardList";

const ClusterListPage = () => {
  const [clusters, setClusters] = React.useState<Cluster[]>([]);
  const dash = useDash();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<String>();
  const [status, setStatus] = React.useState<string>("active");

  const handleSubmit = async (values: ClusterFormValues) => {
    const res = await createCluster(values);
    if (res.id) {
      setClusters([...clusters, res]);
      setShowModal(false);
      setErrorMessage("");
    } else {
      setErrorMessage(res);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await getAllClusters(status);
      if (res.content) {
        setClusters(res.content.sort((a, b) => a.name.localeCompare(b.name)));
      }
    })();
  }, [status]);

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

          {user.canWrite() && (
            <Button
              className={css`
                margin-left: 1rem;
              `}
              icon={<Add />}
              onClick={() => setShowModal(true)}
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
