import { css } from "@emotion/css";
import { AddCircleFilled } from "@navikt/ds-icons";
import { Button, Heading, ToggleGroup } from "@navikt/ds-react";
import React from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import { createCluster, getAllClusters, mapClusterToFormValues } from "../../api";
import ModalCluster from "../../components/cluster/ModalCluster";
import type { ClusterSubmitValues } from "../../constants";
import { Status } from "../../constants";
import { useDashboard } from "../../hooks";
import { Group, userHasGroup, useUser } from "../../hooks";
import ClusterCardList from "./ClusterCardList";

const ClusterListPage = () => {
  const user = useUser();
  const dash = useDashboard();
  const [status, setStatus] = React.useState<Status>(Status.ACTIVE);
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const clusterQuery = useQuery({
    queryKey: ["getAllClusters", status],
    queryFn: () => getAllClusters({ status }),
    select: (data) => data.content,
  });

  const clusters = clusterQuery.data ?? [];

  const handleSubmit = async (values: ClusterSubmitValues) => {
    const response = await createCluster({ ...values });
    if (response.id) {
      setShowModal(false);
      navigate(`/cluster/${response.id}`);
    } else {
      console.log(response);
    }
  };

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
        <Heading level="1" size="large">
          Klynger
        </Heading>

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
            onChange={(value) => setStatus(value as Status)}
            size="medium"
            value={status}
          >
            <ToggleGroup.Item value={Status.ACTIVE}>Aktive ({dash?.clusterCount})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.PLANNED}>Fremtidige ({dash?.clusterCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.INACTIVE}>Inaktive ({dash?.clusterCountInactive})</ToggleGroup.Item>
          </ToggleGroup>

          {userHasGroup(user, Group.WRITE) && (
            <Button
              className={css`
                margin-left: 1rem;
              `}
              icon={<AddCircleFilled />}
              onClick={() => setShowModal(true)}
              size="medium"
              variant="secondary"
            >
              Opprett ny klynge
            </Button>
          )}
        </div>
      </div>
      {clusters.length > 0 && <ClusterCardList clusterList={clusters} />}

      {showModal && (
        <ModalCluster
          initialValues={mapClusterToFormValues()}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmitForm={(values: ClusterSubmitValues) => handleSubmit(values)} //ProductAreaSubmitValues
          title="Opprett ny klynge"
        />
      )}
    </React.Fragment>
  );
};

export default ClusterListPage;
