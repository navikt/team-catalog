import {env} from '../../util/env'
import Button from '../common/Button'
import {faFileExcel} from '@fortawesome/free-solid-svg-icons'
import {StyledLink} from 'baseui/link'
import React from 'react'


export const TeamExport = (props: {productAreaId?: string, clusterId?: string}) => {
    const {productAreaId, clusterId} = props

    return (
        <StyledLink
            style={{textDecoration: 'none'}}
            href={`${env.teamCatalogBaseUrl}/team/export/${
                productAreaId != null ? `PRODUCT_AREA?id=${productAreaId}` :
                    clusterId != null ? `CLUSTER?id=${clusterId}` :
                        'ALL'
            }`}>
            <Button
                kind={'outline'}
                size={'compact'}
                icon={faFileExcel}
                tooltip={'Eksporter team'}
                marginRight
            >
                Eksporter team
            </Button>
        </StyledLink>
    )
}
