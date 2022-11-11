import { css } from "@emotion/css";
import { AddCircleFilled } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import React from "react";

import { PageHeader } from "../../components/PageHeader";
import { Status } from "../../constants";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";
import { useDashboard } from "../../hooks/useDashboard";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import ProductAreaCardList from "./ProductAreaCardList";

const ProductAreaListPage = () => {
  const user = useUser();
  const [status, setStatus] = React.useState<Status>(Status.ACTIVE);
  const dash = useDashboard();

  const productAreaQuery = useAllProductAreas({ status });

  const productAreas = productAreaQuery.data ?? [];

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
              disabled
              icon={<AddCircleFilled />}
              size="medium"
              variant="secondary"
            >
              Opprett nytt område
            </Button>
          )}
        </div>
      </div>
      {productAreas.length > 0 && <ProductAreaCardList areaList={productAreas} />}
    </React.Fragment>
  );
};

export default ProductAreaListPage;
