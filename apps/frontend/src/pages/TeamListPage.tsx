import * as React from 'react'
import { H4 } from 'baseui/typography'
import ListView from '../components/common/ListView'

const mock = [
    {
        description: "Beskrivelse1",
        id: "1",
        name: "Produktområde Helse"
    },
    {
        description: "Beskrivelse1",
        id: "2",
        name: "Produktområde random"
    },
    {
        description: "Beskrivelse1",
        id: "3",
        name: "Navn1"
    }
]

const TeamListPage = () => {
    return (
        <React.Fragment>
            <H4>Teams</H4>

            <ListView list={mock} />
        </React.Fragment>
    )
}

export default TeamListPage