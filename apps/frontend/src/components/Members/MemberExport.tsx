import {env} from '../../util/env'
import Button from '../common/Button'
import {faFileExcel} from '@fortawesome/free-solid-svg-icons'
import {StyledLink} from 'baseui/link'
import React from 'react'
import {TeamRole} from '../../constants'


export const MemberExport = (props: { teamId?: string, productAreaId?: string, role?: TeamRole }) => {
  const {teamId, productAreaId, role} = props

  return (
    <StyledLink
      style={{textDecoration: 'none'}}
      href={`${env.teamCatalogBaseUrl}/member/export/${
        productAreaId != null ? `PRODUCT_AREA?id=${productAreaId}` :
          teamId != null ? `TEAM?id=${teamId}` :
            role != null ? `ROLE?id=${role}` :
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
