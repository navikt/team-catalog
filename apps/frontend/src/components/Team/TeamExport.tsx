import {env} from '../../util/env'
import Button from '../common/Button'
import {faFileExcel} from '@fortawesome/free-solid-svg-icons'
import {StyledLink} from 'baseui/link'
import React from 'react'


export const TeamExport = (props: {productAreaId?: string}) => {
  const {productAreaId} = props

  return (
    <StyledLink
      style={{textDecoration: 'none'}}
      href={`${env.teamCatalogBaseUrl}/team/export/${productAreaId != null ? `PRODUCT_AREA?id=${productAreaId}` : 'ALL'}`}>
      <Button
        kind={'outline'}
        size={'compact'}
        icon={faFileExcel}
        tooltip={'Eksporter teams'}
        marginRight
      >
        Eksporter teams
      </Button>
    </StyledLink>
  )
}
