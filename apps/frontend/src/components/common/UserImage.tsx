import User from '../../resources/user.svg'
import * as React from 'react'

const getResourceImage = (navIdent: string) => `https://teamkatalog-api.nais.adeo.no/resource/${navIdent}/photo`


export const UserImage = (props: { ident: string, maxWidth: string }) => {
  const [image, setImage] = React.useState(getResourceImage(props.ident))

  return (
    <img
      src={image}
      onError={() => setImage(User)}
      alt="Member image"
      style={{maxWidth: props.maxWidth}}
    />
  )
}
