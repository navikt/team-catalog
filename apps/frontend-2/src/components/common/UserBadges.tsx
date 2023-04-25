import { css } from "@emotion/css";

import type { Membership } from "../../api";
import securityChampion from "../../assets/badges/SecurityChampion.svg";
import type { Cluster, ProductArea, ProductTeam, Resource } from "../../constants";
import { TeamRole } from "../../constants";

const badgeStyle = css({
  width: "3em",
  height: "3em",
});

const getRoles = (memberships: ProductTeam[] | ProductArea[] | Cluster[], resource: Resource): TeamRole[] => {
  return memberships
    .flatMap((unit) => unit.members.find((member) => member.navIdent === resource.navIdent))
    .flatMap((teamMembership) => teamMembership?.roles || []);
};
export const UserBadges = ({ memberships, resource }: { memberships: Membership; resource: Resource }) => {
  const allRoles = [
    ...getRoles(memberships.teams, resource),
    ...getRoles(memberships.productAreas, resource),
    ...getRoles(memberships.clusters, resource),
  ];
  if (allRoles.includes(TeamRole.SECURITY_CHAMPION)) {
    return <img alt={"Security champion badge"} className={badgeStyle} src={securityChampion} />;
  }
  return <></>;
};
