import { css } from "@emotion/css";
import { useQuery } from "react-query";

import { getResourceUnitsById } from "../../api";
import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { ProductArea, Resource } from "../../constants";

const ProductAreaOwnerResource = (properties: { resource: Resource }) => {
  const { navIdent, fullName } = properties.resource;

  const unitsQuery = useQuery({
    queryKey: ["getResourceUnitsById", navIdent],
    queryFn: () => getResourceUnitsById(navIdent),
    select: (data) => (data?.units ?? [])[0]?.parentUnit?.name ?? "fant ikke avdeling",
  });

  return (
    <div
      className={css`
        margin-bottom: 8px;
      `}
    >
      <div
        className={css`
          display: inline;
        `}
      >
        <a href={`/resource/${navIdent}`}>{fullName}</a>
        <div
          className={css`
            margin-left: 10px;
            display: inline;
          `}
        >
          ({unitsQuery.isLoading ? "laster" : unitsQuery.data ?? "fant ikke avdeling"})
        </div>
      </div>
    </div>
  );
};

const OwnerAreaSummary = ({ productArea }: { productArea: ProductArea }) => {
  return (
    <ResourceInfoContainer title="Eiere">
      {productArea.paOwnerGroup?.ownerResource ? (
        <TextWithLabel
          label={"Produktområde eier"}
          text={<ProductAreaOwnerResource resource={productArea.paOwnerGroup.ownerResource} />}
        />
      ) : (
        <TextWithLabel label="Produktområde eier" text={"Ingen eier"} />
      )}
      {productArea.paOwnerGroup?.ownerGroupMemberResourceList?.length ?? 0 > 0 ? (
        <TextWithLabel
          label={"Produktområde eiergruppe"}
          text={productArea.paOwnerGroup?.ownerGroupMemberResourceList.map((it) => {
            return <ProductAreaOwnerResource key={it.navIdent} resource={it} />;
          })}
        />
      ) : (
        <TextWithLabel label={"Produktområde eiergruppe"} text={"Ingen eiergrupper"} />
      )}
    </ResourceInfoContainer>
  );
};

export default OwnerAreaSummary;
