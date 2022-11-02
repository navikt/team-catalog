import { css } from '@emotion/css'

import type { Cluster} from '../../../constants';
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
      {clusters.map((cluster: Cluster) => (
        <CardCluster cluster={cluster} key={cluster.id} />
      ))}
    </div>
  )
}

export default Teams
