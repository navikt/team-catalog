import {env} from '../../util/env'
import { useNavigate } from 'react-router-dom'
import { Button} from '@navikt/ds-react'
import { File } from '@navikt/ds-icons'


export const TeamExport = (props: {productAreaId?: string, clusterId?: string}) => {
    const {productAreaId, clusterId} = props
    const navigate = useNavigate()
    return (
       
        <Button 
            variant="secondary" 
            size="medium" 
            icon={<File />}
            onClick={(e) => navigate(`${env.teamCatalogBaseUrl}/team/export/${
                productAreaId != null ? `AREA?id=${productAreaId}` :
                    clusterId != null ? `CLUSTER?id=${clusterId}` :
                        'ALL'
             }`)}
        >
            Eksporter team
        </Button>
    )
}
