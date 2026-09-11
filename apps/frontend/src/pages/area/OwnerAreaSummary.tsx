import { css } from "@emotion/css";
import { Link } from "react-router-dom";

import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { Member, ProductArea } from "../../constants";
import { Role } from "../../constants";
import { RoleLeaderGroup } from "../../constants";
import { intl } from "../../util/intl/intl";

const ProductAreaOwnerResource = ({ member }: { member: Member; leder?: boolean; nomOwnerGroupMember?: boolean }) => {
  const { navIdent, fullName } = member.resource;

  const onlyLeaderRoles = (member.roles ?? []).filter((it) => Object.values(RoleLeaderGroup).includes(it as any));
  const rolesTranslated = onlyLeaderRoles.map((it) => intl[it]) ?? [];

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
          <Link to={`/resource/${navIdent}`}>{fullName}</Link> {rolesTranslated && ` (${rolesTranslated})`}
        </div>
      </div>
    </div>
  );
};

export const OwnerAreaSummary = ({ productArea }: { productArea: ProductArea }) => {
  const ownerGroupMemberResourceList =
    productArea?.members?.filter((x) => x.roles.some((y) => Object.values(RoleLeaderGroup).includes(y as any))) || [];

  const isLeader = (m: Member) => m.roles.includes(Role.LEADER);
  const leaderMember = ownerGroupMemberResourceList.find(isLeader);
  const nonLeaderMember = ownerGroupMemberResourceList.filter((it) => !isLeader(it));

  return (
    <ResourceInfoContainer
      title={(productArea.ownerGroupNavidentList?.length ?? 0 > 0) ? "Tverrfaglig lederteam" : "Ledergruppe"}
    >
      {ownerGroupMemberResourceList.length > 0 ? (
        <>
          {leaderMember && (
            <TextWithLabel
              label={"Ledergruppe leder"}
              text={<ProductAreaOwnerResource key={leaderMember.navIdent} member={leaderMember} />}
            />
          )}

          {nonLeaderMember.length > 0 && (
            <TextWithLabel
              label={"Ledergruppe medlemmer"}
              text={
                <>
                  {nonLeaderMember.map((member) => (
                    <ProductAreaOwnerResource key={member.navIdent} member={member} />
                  ))}
                </>
              }
            />
          )}
        </>
      ) : (
        <TextWithLabel label={"Ledergruppe"} text={"Ingen ledergrupper"} />
      )}
    </ResourceInfoContainer>
  );
};
