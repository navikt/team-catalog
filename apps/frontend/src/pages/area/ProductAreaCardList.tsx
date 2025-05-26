import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getOrgEnheter } from "../../api/orgEnhetApi";
import { NomOrgLink } from "../../components/NomOrgLink";
import type { ProductArea } from "../../constants";
import { AreaType } from "../../constants";
import type { DashData } from "../../hooks";
import { useDashboard } from "../../hooks";
import type { OrgEnhetDto } from "../../types/teamcat-models";
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

const useOrgEnheter = (orgEnhetIds: string[]) => {
  return useQuery({
    queryKey: ["getOrgEnheter", orgEnhetIds],
    queryFn: () => getOrgEnheter(orgEnhetIds),
    enabled: !!orgEnhetIds,
  });
};

const createGroupedResourcesInner = (
  groupedDepartmentList: Map<string, OrgEnhetDto>,
  departmentId: string,
  areas: ProductArea[],
  dash: DashData | undefined,
) => {
  const leder = groupedDepartmentList.get(departmentId)?.leder[0].ressurs;
  const departmentName = groupedDepartmentList.get(departmentId)?.navn;
  return (
    <>
      <Heading level="5" size="medium">
        {departmentName}
      </Heading>
      <p>
        <Link to={`/resource/${leder?.navident}`}>{leder?.visningsnavn}</Link> er leder for avdelingen.{" "}
        <NomOrgLink nomId={departmentId} tekst="Åpne avdelingen i NOM" />
      </p>
      <div className={areaDivStyle}>
        {productAreas(areas, AreaType.PRODUCT_AREA, dash).map((pa) => (
          <ProductAreaCard color={"#C9E7D1"} key={pa.id} pa={pa} />
        ))}
      </div>
    </>
  );
};

export const ProductAreaCardList = (properties: ProductAreaCardListProperties) => {
  const { areaList } = properties;
  const dash = useDashboard();

  const productAreaList = areaList.filter((area) => area.areaType === AreaType.PRODUCT_AREA);
  const departmentList = Map.groupBy(productAreaList, (area) => area.avdelingNomId);
  const departmentOrgEnheterData = useOrgEnheter(departmentList.keys().toArray()).data || [];
  const groupedDepartmentList = new Map(departmentOrgEnheterData.map((department) => [department.id, department]));
  console.log(groupedDepartmentList);
  return (
    <>
      <Heading level="2" size="medium" spacing>
        Seksjoner
      </Heading>
      {Array.from(departmentList).map(([departmentId, areas]) =>
        createGroupedResourcesInner(groupedDepartmentList, departmentId, areas, dash),
      )}

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
