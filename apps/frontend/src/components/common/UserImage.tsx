import User from '../../resources/user.svg'
import * as React from 'react'
import { StatefulTooltip } from 'baseui/tooltip'

const getResourceImage = (navIdent: string) => `https://teamkatalog-api.nais.adeo.no/resource/${navIdent}/photo`


export const UserImage = (props: { ident: string, maxWidth: string }) => {
    const [image, setImage] = React.useState(getResourceImage(props.ident))

    return (
        <StatefulTooltip
            content={"Trykk for oppdatering av bilde"}
        >
            <img
                src={image}
                onError={() => setImage(User)}
                onClick={() => setImage(getResourceImage(props.ident) + "?forceUpdate=true")}
                alt={`Member image${props.ident}`}
                style={{maxWidth: props.maxWidth}}
            />
        </StatefulTooltip>
    )
}
