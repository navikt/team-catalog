import { css } from '@emotion/css'
import { Link } from '@navikt/ds-react'
import { useLocation } from 'react-router-dom'

interface navItemProperties {
  url: string
  label: string
}

const NavItem = (properties: navItemProperties) => {
  if (properties.url.includes(useLocation().pathname.split('/')[1]) && useLocation().pathname.split('/')[1]) {
    return (
      <Link
        className={css`
          color: white;
          text-decoration: underline white 2px;
        `}
        href={properties.url}>
        {properties.label}
      </Link>
    )
  }
  return (
    <Link
      className={css`
        color: white;
      `}
      href={properties.url}>
      {properties.label}
    </Link>
  )
}

export default NavItem
