import { css } from "@emotion/css";
import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Button, Heading, ToggleGroup } from "@navikt/ds-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { createProductArea, mapProductAreaToFormValues } from "../../api/productAreaApi";
import type { ProductAreaSubmitValues } from "../../constants";
import { Status } from "../../constants";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";
import { useDashboard } from "../../hooks/useDashboard";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
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
    } else {
      console.log(response);
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
          column-gap: 2rem;
          row-gap: 1rem;

          h1 {
            flex: 1;
          }
        `}
      >
        <Heading level="1" size="large">
          Områder
        </Heading>
        <ToggleGroup onChange={(value) => setStatus(value as Status)} size="medium" value={status}>
          <ToggleGroup.Item value={Status.ACTIVE}>Aktive ({dash?.productAreasCount})</ToggleGroup.Item>
          <ToggleGroup.Item value={Status.PLANNED}>Fremtidige ({dash?.productAreasCountPlanned})</ToggleGroup.Item>
          <ToggleGroup.Item value={Status.INACTIVE}>Inaktive ({dash?.productAreasCountInactive})</ToggleGroup.Item>
        </ToggleGroup>

        {userHasGroup(user, Group.WRITE) && (
          <>
            <Button icon={<PlusCircleIcon />} onClick={() => setShowModal(true)} size="medium" variant="secondary">
              Opprett nytt område
            </Button>
            <ModalArea
              initialValues={mapProductAreaToFormValues()}
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSubmitForm={(values: ProductAreaSubmitValues) => handleSubmit(values)}
              title="Opprett nytt område"
            />
          </>
        )}
      </div>
      {productAreas.length > 0 && <ProductAreaCardList areaList={productAreas} />}
    </React.Fragment>
  );
};
