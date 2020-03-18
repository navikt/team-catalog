import * as React from 'react'
import { H4 } from 'baseui/typography'
import ListView from '../components/common/ListView'
import { useAwait } from '../util/hooks'
import { user } from '../services/User'

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

const ProductAreaListPage = () => {
    useAwait(user.wait())

    return (
        <React.Fragment>
            <H4>Produktområder</H4>

            <ListView list={mock} />
        </React.Fragment>
    )
}

export default ProductAreaListPage