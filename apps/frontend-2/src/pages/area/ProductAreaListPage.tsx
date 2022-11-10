import { css } from "@emotion/css";
import { AddCircleFilled } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import React from "react";
import { useQuery } from "react-query";

import { getAllProductAreas } from "../../api";
import PageTitle from "../../components/PageTitle";
import { useDashboard } from "../../hooks/useDashboard";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import ProductAreaCardList from "./ProductAreaCardList";

const ProductAreaListPage = () => {
  const user = useUser();
  const [status, setStatus] = React.useState<string>("active");
  const dash = useDashboard();

  const productAreaQuery = useQuery({
    queryKey: ["getAllProductAreas", status],
    queryFn: () => getAllProductAreas(status as string),
    select: (data) => sortBy(data.content, (productArea) => productArea.name.toLowerCase()),
  });

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
        <PageTitle title="Områder" />

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
            <ToggleGroup.Item value="active">Aktive ({dash?.productAreasCount})</ToggleGroup.Item>
            <ToggleGroup.Item value="planned">Fremtidige ({dash?.productAreasCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value="inactive">Inaktive ({dash?.productAreasCountInactive})</ToggleGroup.Item>
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
