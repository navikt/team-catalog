import { css } from "@emotion/css";
import { PlusCircleFillIcon } from "@navikt/aksel-icons";
import { Button, Heading, ToggleGroup } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import { createCluster, getAllClusters, mapClusterToFormValues } from "../../api/clusterApi";
import type { ClusterSubmitValues } from "../../constants";
import { Status } from "../../constants";
import { useDashboard } from "../../hooks";
import { Group, userHasGroup, useUser } from "../../hooks";
import { ClusterCardList } from "./ClusterCardList";
import { ModalCluster } from "./ModalCluster";

export const ClusterListPage = () => {
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

  useEffect(() => {
    document.title = `Teamkatalogen`;
  }, [clusters]);

  return (
    <React.Fragment>
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          column-gap: 2rem;
          row-gap: 1rem;

          h1 {
            flex: 1;
          }
        `}
      >
        <Heading level="1" size="large">
          Klynger
        </Heading>
        <ToggleGroup
          onChange={(value) => setStatus(value as Status)}
          size="medium"
          value={status}
        >
          <ToggleGroup.Item value={Status.ACTIVE}>Aktive ({dash?.clusterCount})</ToggleGroup.Item>
          <ToggleGroup.Item value={Status.PLANNED}>Fremtidige ({dash?.clusterCountPlanned})</ToggleGroup.Item>
          <ToggleGroup.Item value={Status.INACTIVE}>Inaktive ({dash?.clusterCountInactive})</ToggleGroup.Item>
        </ToggleGroup>

        {userHasGroup(user, Group.WRITE) && (
          <>
            <Button
              icon={<PlusCircleFillIcon />}
              onClick={() => setShowModal(true)}
              size="medium"
              variant="secondary"
            >
              Opprett ny klynge
            </Button>
            {showModal && (
              <ModalCluster
                initialValues={mapClusterToFormValues()}
                isOpen
                onClose={() => setShowModal(false)}
                onSubmitForm={(values: ClusterSubmitValues) => handleSubmit(values)} //ProductAreaSubmitValues
                title="Opprett ny klynge"
              />
            )}
          </>
        )}
      </div>
      {clusters.length > 0 && <ClusterCardList clusterList={clusters} />}
    </React.Fragment>
  );
};
