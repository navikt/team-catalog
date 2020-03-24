import * as React from 'react'
import Metadata from '../components/common/Metadata'
import { RouteComponentProps } from 'react-router-dom'
import { ProductTeam, ProductArea } from '../constants'
import { getTeam } from '../api/teamApi'
import { H4, Label2 } from 'baseui/typography'
import { Block } from 'baseui/block'
import MemberList from '../components/Team/MemberList'
import AccordionMembers from '../components/Team/AccordionMembers'
import { theme } from '../util'

export type PathParams = { id: string }

const TeamPage = (props: RouteComponentProps<PathParams>) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [team, setTeam] = React.useState<ProductTeam>()
    const [productAreaName, setProductAreaName] = React.useState<string>('')

    React.useEffect(() => {
        (async () => {
            if (props.match.params.id) {
                setLoading(true)
                const res = await getTeam(props.match.params.id)
                console.log(res)
                setTeam(res)
                setLoading(false)
            }
        })()

    }, [props.match.params])

    return (
        <>
            {!loading && team && (
                <>
                    <H4>{team.name}</H4>
                    <Block>
                        <Metadata
                            productAreaName="Navn"
                            description={team.description}
                            slackChannel={team.slackChannel}
                            naisTeams={team.naisTeams}
                        />
                    </Block>
                    <Block width="50%" marginTop="2rem">
                        <Label2 marginBottom={theme.sizing.scale600}>Medlemmer av teamet</Label2>
                        <AccordionMembers members={team.members} />
                    </Block>

                </>
            )}
        </>
    )
}

export default TeamPage