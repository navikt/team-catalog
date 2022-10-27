import { css } from '@emotion/css'
import { Loader, Tooltip } from '@navikt/ds-react'
import * as React from 'react'
import { useState } from 'react'

import User from '../assets/user.svg'
import { env } from '../util/env'

export const resourceImageLink = (navIdent: string, forceUpdate = false) =>
  `${environment.teamCatalogBaseUrl}/resource/${navIdent}/photo` +
  (forceUpdate ? '?forceUpdate=true' : '')

export const UserImage = (properties: {
  ident: string
  size: string
  disableRefresh?: boolean
  border?: boolean
}) => {
  const { size, ident, disableRefresh, border } = properties
  const [image, setImage] = React.useState(resourceImageLink(ident))
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
      alt={`Profilbilde ${ident}`}
      onClick={() => {
        if (disableRefresh) {
          return
        }
        setImage(resourceImageLink(ident, true))
        setLoading(true)
      }}
      onError={() => {
        setImage(User)
        setLoading(false)
      }}
      onLoad={() => setLoading(false)}
      src={image}
      style={{
        width: loading ? 0 : size,
        height: loading ? 0 : size,
        borderRadius: '100%',
        boxShadow: border
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
