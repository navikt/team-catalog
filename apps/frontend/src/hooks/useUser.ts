import { useQuery } from "react-query";

import { getUserInfo } from "../api/userApi";
import type { UserInfo } from "../constants";
import type { ProductTeamResponse } from "../constants";

export enum Group {
  READ = "READ",
  WRITE = "WRITE",
  ADMIN = "ADMIN",
}

export function useUser(): UserInfo {
  const userQuery = useQuery({
    queryKey: ["getUserInfo"],
    queryFn: () => getUserInfo(),
  });

  return userQuery.data?.data ?? { loggedIn: false, groups: [] };
}

export function userHasGroup(user: UserInfo, group: Group) {
  return user.groups.includes(group);
}

export function userIsMemberOfTeam(user: UserInfo, team: ProductTeamResponse) {
  if (!user.loggedIn) {
    return false;
  }
  return team.members.find((member) => member.navIdent === user.ident) || team.contactPersonIdent === user.ident;
}
