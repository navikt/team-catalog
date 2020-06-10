import User from '../../resources/user.svg'
import * as React from 'react'
import { useState } from 'react'
import { StatefulTooltip } from 'baseui/tooltip'
import { Spinner } from './Spinner'
import { Block } from 'baseui/block'

const getResourceImage = (navIdent: string) => `https://teamkatalog.nais.adeo.no/api/resource/${navIdent}/photo`


export const UserImage = (props: { ident: string, size: string, disableRefresh?: boolean }) => {
  const {size, ident, disableRefresh} = props
  const [image, setImage] = React.useState(getResourceImage(props.ident))
  const [loading, setLoading] = useState(true)

  const loadingSpinner = loading && <Block width={size} height={size}><Spinner size='100%'/></Block>
  const imageTag = <img
    src={image}
    onError={() => {
      setImage(User)
      setLoading(false)
    }}
    onLoad={() => setLoading(false)}
    onClick={() => {
      if (props.disableRefresh) {
        return
      }
      setImage(getResourceImage(ident) + "?forceUpdate=true")
      setLoading(true)
    }}
    alt={`Profilbilde ${ident}`}
    style={{
      width: loading ? 0 : size,
      height: loading ? 0 : size,
      borderRadius: '100%'
    }}
  />

  if (disableRefresh) {
    return <>
      {loadingSpinner}
      {imageTag}
    </>
  }

  return <>
    {loadingSpinner}
    <StatefulTooltip content={"Bildet hentes fra outlook/navet. Trykk på bildet for å hente på ny."}>
      {imageTag}
    </StatefulTooltip>
  </>
}
