import { env } from '../../util/env'
import Button from '../common/Button'
import { faFileExcel } from '@fortawesome/free-solid-svg-icons'
import { StyledLink } from 'baseui/link'
import React from 'react'


export const MemberExport = (props: { teamId?: string, productAreaId?: string }) => {
  const {teamId, productAreaId} = props

  return (
    <StyledLink
      style={{textDecoration: 'none'}}
      href={`${env.teamCatalogBaseUrl}/member/export/${
        productAreaId != null ? `PRODUCT_AREA?id=${productAreaId}` :
          teamId != null ? `TEAM?id=${teamId}` : 'ALL'
      }`}>
      <Button
        kind={'outline'}
        size={'compact'}
        icon={faFileExcel}
        tooltip={'Eksporter'}
        marginRight
      >
        Eksporter
      </Button>
    </StyledLink>
  )
}
