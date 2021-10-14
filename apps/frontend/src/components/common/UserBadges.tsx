import React from 'react'
import { Cluster, ProductArea, ProductTeam, Resource, TeamRole } from '../../constants'
import { Membership } from '../../api'
import securityChampionLogo from '../../resources/badges/SecurityChampion.svg'
import { Block } from 'baseui/block'
import { theme } from '../../util'

function getRoles(membership: ProductTeam[] | ProductArea[] | Cluster[], resource: Resource): TeamRole[] {
  return membership.flatMap((team) => (
    team.members.find((member) => (
      member.navIdent === resource.navIdent)
    )
  )).flatMap((teamMembership) => teamMembership?.roles || [])
}

export const UserBadges = ({memberships, resource}: {memberships: Membership, resource: Resource}) => {
  const allRoles = [
    ...getRoles(memberships.teams, resource),
    ...getRoles(memberships.productAreas, resource),
    ...getRoles(memberships.clusters, resource)
  ];
  if (allRoles.includes(TeamRole.SECURITY_CHAMPION)) {
    return (<Block marginLeft={theme.sizing.scale600} marginTop={theme.sizing.scale600}>
      <img src={securityChampionLogo} alt="Security Champion" width="75px"/>
    </Block>)
  }

  return null;
}
