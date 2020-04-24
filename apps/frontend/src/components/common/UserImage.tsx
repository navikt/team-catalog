import User from '../../resources/user.svg'
import * as React from 'react'
import { StatefulTooltip } from 'baseui/tooltip'

const getResourceImage = (navIdent: string) => `https://teamkatalog.nais.adeo.no/api/resource/${navIdent}/photo`


export const UserImage = (props: { ident: string, maxWidth: string }) => {
  const [image, setImage] = React.useState(getResourceImage(props.ident))

  return (
    <StatefulTooltip
      content={"Bildet hentes fra outlook/navet. Der kan du endre bildet ditt. Trykk her etterpå for å oppfriske bildet om det ikke er oppdatert."}
    >
      <img
        src={image}
        onError={() => setImage(User)}
        onClick={() => setImage(getResourceImage(props.ident) + "?forceUpdate=true")}
        alt={`Member image${props.ident}`}
        style={{
          maxWidth: props.maxWidth,
          borderRadius: '100%'
        }}
      />
    </StatefulTooltip>
  )
}
