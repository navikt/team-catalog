import User from '../assets/user.svg'
import * as React from 'react'
import { useState } from 'react'
import { env } from '../util/env'
import { css } from '@emotion/css'
import { Loader, Tooltip } from '@navikt/ds-react'

export const resourceImageLink = (navIdent: string, forceUpdate = false) =>
  `${env.teamCatalogBaseUrl}/resource/${navIdent}/photo` +
  (forceUpdate ? '?forceUpdate=true' : '')

export const UserImage = (props: {
  ident: string
  size: string
  disableRefresh?: boolean
  border?: boolean
}) => {
  const { size, ident, disableRefresh } = props
  const [image, setImage] = React.useState(resourceImageLink(props.ident))
  const [loading, setLoading] = useState(true)

  const loadingSpinner = loading && (
    <div
      className={css`
        width: ${size};
        height: ${size};
      `}
    >
      <Loader size='medium' />
    </div>
  )
  const imageTag = (
    <img
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
        setImage(resourceImageLink(ident, true))
        setLoading(true)
      }}
      alt={`Profilbilde ${ident}`}
      style={{
        width: loading ? 0 : size,
        height: loading ? 0 : size,
        borderRadius: '100%',
        boxShadow: props.border
          ? '0 0 2px 2px black inset, 0 0 2px 2px black'
          : undefined,
      }}
    />
  )

  if (disableRefresh) {
    return (
      <>
        {loadingSpinner}
        {imageTag}
      </>
    )
  }

  return (
    <>
      {loadingSpinner}
      <Tooltip
        content={
          'Bildet hentes fra outlook/navet. Trykk på bildet for å hente på ny.'
        }
      >
        {imageTag}
      </Tooltip>
    </>
  )
}
