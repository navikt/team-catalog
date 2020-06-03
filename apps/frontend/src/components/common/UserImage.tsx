import User from '../../resources/user.svg'
import * as React from 'react'
import { useState } from 'react'
import { StatefulTooltip } from 'baseui/tooltip'
import { Spinner } from 'baseui/spinner'

const getResourceImage = (navIdent: string) => `https://teamkatalog.nais.adeo.no/api/resource/${navIdent}/photo`


export const UserImage = (props: { ident: string, maxWidth: string }) => {
  const [image, setImage] = React.useState(getResourceImage(props.ident))
  const [loading, setLoading] = useState(true)

  const maxSize = props.maxWidth
  const ident = props.ident
  return (
    <>
      {loading && <Spinner size={maxSize}/>}
      <StatefulTooltip
        content={"Bildet hentes fra outlook/navet. Trykk på bildet for å oppfriske bildet om det er blitt endret."}
      >
        <img
          src={image}
          onError={() => {
            setImage(User)
            setLoading(false)
          }}
          onLoad={() => setLoading(false)}
          onClick={() => {
            setImage(getResourceImage(ident) + "?forceUpdate=true")
            setLoading(true)
          }}
          alt={`Profilbilde ${ident}`}
          style={{
            width: loading ? 0 : maxSize,
            height: loading ? 0 : maxSize,
            borderRadius: '100%'
          }}
        />
      </StatefulTooltip>
    </>
  )
}
