import { css } from "@emotion/css"
import { Member } from "../../constants"
import CardMember from "./CardMember"

const listStyles = css`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`

type MembersNewProps = {
    members: Member[]
}

const Members = (props: MembersNewProps) => {
    const { members } = props

    return (
        <div className={listStyles}>
            {members.map((m: Member) => (<CardMember  member={m} />))}
        </div>
    )
}

export default Members