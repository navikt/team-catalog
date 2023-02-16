import { css } from "@emotion/css";
import { AddCircleFilled } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import React from "react";
import { createProductArea, mapProductAreaToFormValues } from "../../api";
import ModalArea from "../../components/area/ModalArea";

import { PageHeader } from "../../components/PageHeader";
import { ProductAreaFormValues, ProductAreaSubmitValues, Status } from "../../constants";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";
import { useDashboard } from "../../hooks/useDashboard";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import ProductAreaCardList from "./ProductAreaCardList";

const ProductAreaListPage = () => {
  const [status, setStatus] = React.useState<Status>(Status.ACTIVE);
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const user = useUser();
  const dash = useDashboard();
  const productAreaQuery = useAllProductAreas({ status });
  const productAreas = productAreaQuery.data ?? [];

  const handleSubmit = async (values: ProductAreaSubmitValues) => {
    console.log(values, "VAL")
    const response = await createProductArea({...values});
    if (response.id) {
      setShowModal(false);
      productAreaQuery.refetch()
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
        <PageHeader title="Områder" />

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
            <ToggleGroup.Item value={Status.ACTIVE}>Aktive ({dash?.productAreasCount})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.PLANNED}>Fremtidige ({dash?.productAreasCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.INACTIVE}>Inaktive ({dash?.productAreasCountInactive})</ToggleGroup.Item>
          </ToggleGroup>

          {userHasGroup(user, Group.WRITE) && (
            <Button
              className={css`
                margin-left: 1rem;
              `}
              icon={<AddCircleFilled />}
              size="medium"
              variant="secondary"
              onClick={() => setShowModal(true)}
            >
              Opprett nytt område
            </Button>
          )}
        </div>
      </div>
      {productAreas.length > 0 && <ProductAreaCardList areaList={productAreas} />}

      {userHasGroup(user, Group.ADMIN) && (
        <ModalArea
          initialValues={mapProductAreaToFormValues()}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmitForm={(values: ProductAreaSubmitValues) => handleSubmit(values)} //ProductAreaSubmitValues
          title="Opprett nytt område"
        />
      )}
    </React.Fragment>
  );
};

export default ProductAreaListPage;
