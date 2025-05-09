import { css } from "@emotion/css";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getResourceUnitsById } from "../../api/resourceApi";
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
        <Link to={`/resource/${navIdent}`}>{fullName}</Link>
        <div
          className={css`
            margin-left: 10px;
            display: inline;
          `}
        >
          ({unitsQuery.isLoading ? "laster" : (unitsQuery.data ?? "fant ikke avdeling")})
        </div>
      </div>
    </div>
  );
};

export const OwnerAreaSummary = ({ productArea }: { productArea: ProductArea }) => {
  return (
    <ResourceInfoContainer title="Tverrfaglig ledergruppe">
      {productArea.paOwnerGroup?.ownerResource ? (
        <TextWithLabel
          label={"Leder for enheten"}
          text={<ProductAreaOwnerResource resource={productArea.paOwnerGroup.ownerResource} />}
        />
      ) : (
        <TextWithLabel label="Leder for enheten" text={"Ingen eier"} />
      )}
      {(productArea.paOwnerGroup?.ownerGroupMemberResourceList?.length ?? 0 > 0) ? (
        <TextWithLabel
          label={"Ledergruppe"}
          text={productArea.paOwnerGroup?.ownerGroupMemberResourceList.map((it) => {
            return <ProductAreaOwnerResource key={it.navIdent} resource={it} />;
          })}
        />
      ) : (
        <TextWithLabel label={"Ledergruppe"} text={"Ingen ledergrupper"} />
      )}
    </ResourceInfoContainer>
  );
};
