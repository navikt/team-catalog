import { css } from "@emotion/css";
import { Add } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import React from "react";

import { createProductArea, getAllProductAreas } from "../../api";
import { useDash } from "../../components/dash/Dashboard";
import PageTitle from "../../components/PageTitle";
import type { ProductArea, ProductAreaFormValues } from "../../constants";
import { user } from "../../services/User";
import ProductAreaCardList from "./ProductAreaCardList";

const ProductAreaListPage = () => {
  const [productAreaList, setProductAreaList] = React.useState<ProductArea[]>([]);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showContactAllModal, setShowContactAllModal] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [status, setStatus] = React.useState<string>("active");
  const dash = useDash();

  const handleSubmit = async (values: ProductAreaFormValues) => {
    const createProductAreaResponse = await createProductArea(values);
    if (createProductAreaResponse.id) {
      setProductAreaList([...productAreaList, createProductAreaResponse]);
      setShowModal(false);
      setErrorMessage("");
    } else {
      setErrorMessage(createProductAreaResponse);
    }
  };
  const prefixFilters = ["område", "produktområde"];
  const sortName = (name: string) => {
    let sortable = name.toUpperCase();
    let fLength = -1;
    for (const [, f] of prefixFilters.entries()) {
      if (sortable?.indexOf(f) === 0 && f.length > fLength) fLength = f.length;
    }
    if (fLength > 0) {
      sortable = sortable.slice(Math.max(0, fLength)).trim();
    }
    return sortable;
  };

  React.useEffect(() => {
    (async () => {
      const { content } = await getAllProductAreas(status);
      if (content) setProductAreaList(content.sort((a1, a2) => sortName(a1.name).localeCompare(sortName(a2.name))));
    })();
  }, [status]);

  console.log({ productAreaList });
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
              Opprett nytt område
            </Button>
          )}
        </div>
      </div>
      {productAreaList.length > 0 && <ProductAreaCardList areaList={productAreaList} />}
    </React.Fragment>
  );
};

export default ProductAreaListPage;
