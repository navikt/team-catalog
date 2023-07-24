import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import type { ProductArea } from "../../constants";
import { AreaType } from "../../constants";
import type { DashData } from "../../hooks/useDashboard";
import { useDashboard } from "../../hooks/useDashboard";
import type { paCardInterface } from "./ProductAreaCard";
import { ProductAreaCard } from "./ProductAreaCard";

const areaDivStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 3rem;

  @media (width <= 700px) {
    grid-template-columns: 1fr;
  }
`;

type ProductAreaCardListProperties = {
  areaList: ProductArea[];
};

export const productAreas = (
  areaList: ProductArea[],
  type: AreaType,
  dash: DashData | undefined,
): paCardInterface[] => {
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

export const ProductAreaCardList = (properties: ProductAreaCardListProperties) => {
  const { areaList } = properties;
  const dash = useDashboard();

  return (
    <>
      <Heading level="2" size="medium" spacing>
        Produktområder
      </Heading>
      <div className={areaDivStyle}>
        {productAreas(areaList, AreaType.PRODUCT_AREA, dash).map((pa) => (
          <ProductAreaCard color={"#C9E7D1"} key={pa.id} pa={pa} />
        ))}
      </div>
      <Heading level="2" size="medium" spacing>
        IT-område
      </Heading>
      <div className={areaDivStyle}>
        {productAreas(areaList, AreaType.IT, dash).map((pa) => (
          <ProductAreaCard color={"#C3E0EA"} key={pa.id} pa={pa} />
        ))}
      </div>
      <Heading level="2" size="medium" spacing>
        Prosjekt
      </Heading>
      <div className={areaDivStyle}>
        {productAreas(areaList, AreaType.PROJECT, dash).map((pa) => (
          <ProductAreaCard color={"#E4E8BC"} key={pa.id} pa={pa} />
        ))}
      </div>
      <Heading level="2" size="medium" spacing>
        Annet
      </Heading>
      <div className={areaDivStyle}>
        {productAreas(areaList, AreaType.OTHER, dash).map((pa) => (
          <ProductAreaCard color={"#E0D8E9"} key={pa.id} pa={pa} />
        ))}
      </div>
    </>
  );
};
