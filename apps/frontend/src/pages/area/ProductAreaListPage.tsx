import { css } from "@emotion/css";
import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Button, Heading, ToggleGroup } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { createProductArea, mapProductAreaToFormValues } from "../../api/productAreaApi";
import type { ProductAreaSubmitValues } from "../../constants";
import { Status } from "../../constants";
import { useAllProductAreas } from "../../hooks";
import { useDashboard } from "../../hooks";
import { Group, userHasGroup, useUser } from "../../hooks";
import { ModalArea } from "./ModalArea";
import { ProductAreaCardList } from "./ProductAreaCardList";

export const ProductAreaListPage = () => {
  const [status, setStatus] = React.useState<Status>(Status.ACTIVE);
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const user = useUser();
  const dash = useDashboard();
  const productAreaQuery = useAllProductAreas({ status });
  const productAreas = productAreaQuery.data ?? [];

  const handleSubmit = async (values: ProductAreaSubmitValues) => {
    const response = await createProductArea({ ...values });
    if (response.id) {
      setShowModal(false);
      navigate(`/area/${response.id}`);
    }
  };

  useEffect(() => {
    document.title = `Teamkatalogen`;
  }, [productAreas]);

  return (
    <React.Fragment>
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem 2rem;

          h1 {
            flex: 1;
          }
        `}
      >
        <Heading level="1" size="large">
          Seksjoner
        </Heading>
        <ToggleGroup onChange={(value) => setStatus(value as Status)} size="medium" value={status}>
          <ToggleGroup.Item value={Status.ACTIVE}>Aktive ({dash?.productAreasCount})</ToggleGroup.Item>
          <ToggleGroup.Item value={Status.PLANNED}>Fremtidige ({dash?.productAreasCountPlanned})</ToggleGroup.Item>
          <ToggleGroup.Item value={Status.INACTIVE}>Avviklet ({dash?.productAreasCountInactive})</ToggleGroup.Item>
        </ToggleGroup>

        {userHasGroup(user, Group.WRITE) && (
          <>
            <Button icon={<PlusCircleIcon />} onClick={() => setShowModal(true)} size="medium" variant="secondary">
              Opprett ny seksjon
            </Button>
            <ModalArea
              initialValues={mapProductAreaToFormValues()}
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSubmitForm={(values: ProductAreaSubmitValues) => handleSubmit(values)}
              title="Opprett ny seksjon"
            />
          </>
        )}
      </div>
      {productAreas.length > 0 && <ProductAreaCardList areaList={productAreas} />}
    </React.Fragment>
  );
};
