import { css } from '@emotion/css'

import type { Member } from '../../constants'
import CardMember from './CardMember'

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

type MembersNewProperties = {
  members: Member[]
}

const Members = (properties: MembersNewProperties) => {
  const { members } = properties

  return (
    <div className={listStyles}>
      {members.map((member: Member) => (
        <CardMember key={member.navIdent} member={member} />
      ))}
    </div>
  )
}

export default Members
