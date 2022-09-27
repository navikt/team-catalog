import {env} from '../../util/env'
import { Button} from '@navikt/ds-react'
import { File } from '@navikt/ds-icons'
import { theme } from '../../util/theme'


export const TeamExport = (props: {productAreaId?: string, clusterId?: string}) => {
    const {productAreaId, clusterId} = props
    return (
       <a 
            href={`${env.teamCatalogBaseUrl}/team/export/${
                productAreaId != null ? `AREA?id=${productAreaId}` :
                clusterId != null ? `CLUSTER?id=${clusterId}` :
                'ALL'}`} 
            className={theme.linkHideUnderline}
        >
            <Button variant="secondary" size="medium" icon={<File />}>
                Eksporter team
            </Button>
        </a>
    )
}
