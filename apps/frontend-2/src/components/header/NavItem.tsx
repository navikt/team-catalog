import { css } from '@emotion/css'
import { Link } from '@navikt/ds-react'
import { useLocation } from 'react-router-dom'

interface navItemProps {
  url: string
  label: string
}

const NavItem = (props: navItemProps) => {
  if (props.url.includes(useLocation().pathname.split('/')[1]) && useLocation().pathname.split('/')[1]) {
    return (
      <Link
        href={props.url}
        className={css`
          color: white;
          text-decoration: underline white 2px;
        `}>
        {props.label}
      </Link>
    )
  }
  return (
    <Link
      href={props.url}
      className={css`
        color: white;
      `}>
      {props.label}
    </Link>
  )
}

export default NavItem
