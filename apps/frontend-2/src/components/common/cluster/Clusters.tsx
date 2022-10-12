import { css } from '@emotion/css'
import { Cluster, ProductTeam } from '../../../constants'
import CardCluster from './CardCluster'
import CardTeam from '../team/CardTeam'

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

type ClustersNewProps = {
  clusters: Cluster[]
}

const Teams = (props: ClustersNewProps) => {
  const { clusters } = props

  return (
    <div className={listStyles}>
      {clusters.map((m: Cluster) => (
        <CardCluster cluster={m} />
      ))}
    </div>
  )
}

export default Teams
