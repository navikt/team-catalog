import * as React from 'react'
import Metadata from '../components/common/Metadata'
import { RouteComponentProps } from 'react-router-dom'
import { ProductTeam, ProductArea } from '../constants'
import { getTeam } from '../api/teamApi'
import { H4, Label2, Label1, Paragraph2 } from 'baseui/typography'
import { Block } from 'baseui/block'
import { theme } from '../util'
import ListMembers from '../components/common/ListMembers'

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
                    <Block marginTop="3rem">
                        <Label1 marginBottom={theme.sizing.scale800}>Medlemmer av teamet</Label1>
                        {team.members.length > 0 ? <ListMembers members={team.members} /> : <Paragraph2>Ingen medlemmer registrert'</Paragraph2>}

                    </Block>

                </>
            )}
        </>
    )
}

export default TeamPage