import { css } from '@emotion/css'
import { ProductTeam } from '../../../constants'
import CardTeam from './CardTeam'

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

type TeamsNewProps = {
  teams: ProductTeam[]
}

const Teams = (props: TeamsNewProps) => {
  const { teams } = props

  return (
    <div className={listStyles}>
      {teams.map((m: ProductTeam) => (
        <CardTeam team={m} />
      ))}
    </div>
  )
}

export default Teams
