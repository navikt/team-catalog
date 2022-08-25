import {env} from '../../util/env'
import Button from '../common/Button'
import {faFileExcel} from '@fortawesome/free-solid-svg-icons'
import {StyledLink} from 'baseui/link'
import React from 'react'
import {TeamRole} from '../../constants'


export const MemberExport = (props: {teamId?: string, productAreaId: string | null, clusterId: string | null, role?: TeamRole, leaderIdent?: string}) => {
  const {teamId, productAreaId, clusterId, role, leaderIdent} = props

  return (
    <StyledLink
      style={{textDecoration: 'none'}}
      href={`${env.teamCatalogBaseUrl}/member/export/${
        productAreaId != null ? `AREA?id=${productAreaId}` :
          clusterId != null ? `CLUSTER?id=${clusterId}` :
            teamId != null ? `TEAM?id=${teamId}` :
              role != null ? `ROLE?id=${role}` :
                leaderIdent != null ? `LEADER?id=${leaderIdent}` :
                  'ALL'
      }`}>
      <Button
        kind={'outline'}
        size={'compact'}
        icon={faFileExcel}
        tooltip={'Eksporter personer'}
        marginRight
      >
        Eksporter personer
      </Button>
    </StyledLink>
  )
}
