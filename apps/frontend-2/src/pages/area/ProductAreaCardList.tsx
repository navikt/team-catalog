import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import type { DashData } from "../../components/dash/Dashboard";
import { useDash } from "../../components/dash/Dashboard";
import type { ProductArea } from "../../constants";
import { AreaType } from "../../constants";
import type { paCardInterface } from "./ProductAreaCard";
import ProductAreaCard from "./ProductAreaCard";

const categoryStyle = css`
  display: flex;
  flex-direction: column;
  margin-bottom: 3rem;
`;

const areaDivStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

type ProductAreaCardListProperties = {
  areaList: ProductArea[];
};

const productAreas = (areaList: ProductArea[], type: AreaType, dash: DashData | undefined): paCardInterface[] => {
  const out: paCardInterface[] = [];
  const areas = areaList.filter((p: ProductArea) => p.areaType === type);

  if (dash) {
    for (const area of areas) {
      const currentAreaSummary = dash.areaSummaryMap[area.id];
      const currentPa: paCardInterface = {
        name: area.name,
        paInfo: currentAreaSummary,
        id: area.id,
      };
      out.push(currentPa);
    }
  }

  return out;
};

const ProductAreaCardList = (properties: ProductAreaCardListProperties) => {
  const { areaList } = properties;
  const dash = useDash();

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <div className={categoryStyle}>
        <Heading
          className={css`
            margin-bottom: 1rem;
          `}
          level="2"
          size="medium"
        >
          Produktområder
        </Heading>
        <div className={areaDivStyle}>
          {productAreas(areaList, AreaType.PRODUCT_AREA, dash).map((pa) => (
            <ProductAreaCard color={"#C9E7D1"} key={pa.id} pa={pa} />
          ))}
        </div>
      </div>
      <div className={categoryStyle}>
        <Heading
          className={css`
            margin-bottom: 1rem;
          `}
          level="2"
          size="medium"
        >
          IT-område
        </Heading>
        <div className={areaDivStyle}>
          {productAreas(areaList, AreaType.IT, dash).map((pa) => (
            <ProductAreaCard color={"#C3E0EA"} key={pa.id} pa={pa} />
          ))}
        </div>
      </div>
      <div className={categoryStyle}>
        <Heading
          className={css`
            margin-bottom: 1rem;
          `}
          level="2"
          size="medium"
        >
          Prosjekt
        </Heading>
        <div className={areaDivStyle}>
          {productAreas(areaList, AreaType.PROJECT, dash).map((pa) => (
            <ProductAreaCard color={"#E4E8BC"} key={pa.id} pa={pa} />
          ))}
        </div>
      </div>
      <div className={categoryStyle}>
        <Heading
          className={css`
            margin-bottom: 1rem;
          `}
          level="2"
          size="medium"
        >
          Annet
        </Heading>
        <div className={areaDivStyle}>
          {productAreas(areaList, AreaType.OTHER, dash).map((pa) => (
            <ProductAreaCard color={"#E0D8E9"} key={pa.id} pa={pa} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAreaCardList;
