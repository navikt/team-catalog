import { css } from "@emotion/css";
import { Link } from "react-router-dom";

import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { ProductArea, Resource } from "../../constants";

const ProductAreaOwnerResource = ({
  resource,
  leder = false,
  nomOwnerGroupMember = false,
  nomOrgEnhetMapping,
}: {
  resource: Resource;
  leder?: boolean;
  nomOwnerGroupMember?: boolean;
  nomOrgEnhetMapping: Record<string, string[]> | undefined;
}) => {
  const { navIdent, fullName } = resource;

  const resourceNomOrgEnheter = nomOrgEnhetMapping?.[navIdent];
  const resourceNomOrgEnhet = resourceNomOrgEnheter ? resourceNomOrgEnheter : undefined;

  const fagdirektor = resourceNomOrgEnhet?.some((orgEnhetName) => orgEnhetName.toLowerCase().startsWith("fagdirektør"));
  const personalOgBemanningsansvarlig = resourceNomOrgEnhet?.some((orgEnhetName) =>
    orgEnhetName.toLowerCase().startsWith("kompetanse"),
  );

  const roleLabel = leder
    ? undefined
    : nomOwnerGroupMember
      ? fagdirektor
        ? "Fagdirektør"
        : personalOgBemanningsansvarlig
          ? "Personal- og bemanningsansvarlig"
          : undefined
      : "Fag- og leveranseleder";

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
        <div
          className={css`
            display: inline;
          `}
        >
          <Link to={`/resource/${navIdent}`}>{fullName}</Link> {roleLabel && ` (${roleLabel})`}
        </div>
      </div>
    </div>
  );
};

export const OwnerAreaSummary = ({ productArea }: { productArea: ProductArea }) => {
  const nomOwnerGroupMemberNavIdList = productArea?.paOwnerGroup?.nomOwnerGroupMemberNavIdList || [];
  const ownerGroupMemberResourceList = productArea?.paOwnerGroup?.ownerGroupMemberResourceList || [];

  const nomOrgEnhetMapping = productArea.paOwnerGroup?.nomOwnerGroupMemberOrganizationNameMap;

  return (
    <ResourceInfoContainer
      title={
        (productArea?.paOwnerGroup?.ownerGroupMemberResourceList?.length ?? 0 > 0)
          ? "Tverrfaglig lederteam"
          : "Ledergruppe"
      }
    >
      {productArea.paOwnerGroup?.ownerResource ? (
        <TextWithLabel
          label={"Leder for enheten"}
          text={
            <ProductAreaOwnerResource
              leder
              nomOrgEnhetMapping={nomOrgEnhetMapping}
              resource={productArea.paOwnerGroup.ownerResource}
            />
          }
        />
      ) : (
        <TextWithLabel label="Leder for enheten" text={"Ingen eier"} />
      )}

      {nomOwnerGroupMemberNavIdList.length + ownerGroupMemberResourceList.length > 0 ? (
        <TextWithLabel
          label={"Øvrige medlemmer"}
          text={
            <>
              {nomOwnerGroupMemberNavIdList.map((member) => (
                <ProductAreaOwnerResource
                  key={member.navIdent}
                  nomOrgEnhetMapping={nomOrgEnhetMapping}
                  nomOwnerGroupMember
                  resource={member}
                />
              ))}

              {ownerGroupMemberResourceList.map((member) => (
                <ProductAreaOwnerResource
                  key={member.navIdent}
                  nomOrgEnhetMapping={nomOrgEnhetMapping}
                  resource={member}
                />
              ))}
            </>
          }
        />
      ) : (
        <TextWithLabel label={"Ledergruppe"} text={"Ingen ledergrupper"} />
      )}
    </ResourceInfoContainer>
  );
};
