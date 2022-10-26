import { css } from '@emotion/css'

import type { Cluster} from '../../../constants';
import { ProductTeam } from '../../../constants'
import CardTeam from '../team/CardTeam'
import CardCluster from './CardCluster'

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

type ClustersNewProperties = {
  clusters: Cluster[]
}

const Teams = (properties: ClustersNewProperties) => {
  const { clusters } = properties

  return (
    <div className={listStyles}>
      {clusters.map((m: Cluster) => (
        <CardCluster cluster={m} />
      ))}
    </div>
  )
}

export default Teams
