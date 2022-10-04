import { css } from '@emotion/css'
import { Loader } from '@navikt/ds-react'
import React, { useEffect } from 'react'
// import { person, questionMarkIcon } from "./Images";
import User from '../../resources/user.svg'

const imageSrc = (navIdent: string) => `/teamcat/resource/${navIdent}/photo`

type UserImageProps = {
  navIdent?: string
  navn?: string
  size?: string
  altText?: string
}

const UserImage = (props: UserImageProps) => {
  const { navIdent, size, altText, navn } = props
  const [image, setImage] = React.useState<string>()
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    setLoading(true)
    if (navIdent) {
      setImage(imageSrc(navIdent))
    }
  }, [navIdent])

  const stl = css({
    height: size || '65px',
    width: size || '65px',
    borderRadius: '100%',
  })

  if (!navIdent) {
    return (
      <div>
        <img className={stl} src={User} />
      </div>
    )
  }

  return (
    <div>
      {loading && <Loader className={stl} />}
      <img
        hidden={loading}
        src={image}
        alt={altText || 'Fotografi av ' + (navn || navIdent)}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImage(User)
          setLoading(false)
        }}
        className={stl}
      />
    </div>
  )
}

export default UserImage
