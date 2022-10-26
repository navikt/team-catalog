import { css } from '@emotion/css'

import type { ProductTeam } from '../../../constants'
import CardTeam from './CardTeam'

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

type TeamsNewProperties = {
  teams: ProductTeam[]
}

const Teams = (properties: TeamsNewProperties) => {
  const { teams } = properties

  return (
    <div className={listStyles}>
      {teams.map((m: ProductTeam) => (
        <CardTeam team={m} />
      ))}
    </div>
  )
}

export default Teams
