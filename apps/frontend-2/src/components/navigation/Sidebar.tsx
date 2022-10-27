import { css } from '@emotion/css'
import {
  faCodeBranch,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BodyShort,Heading, Tooltip } from '@navikt/ds-react'
import { Link, useLocation } from 'react-router-dom'

import NavLogo from '../../assets/navlogo.svg'
import SlackLogo from '../../assets/Slack_Monochrome_White.svg'
import TkLogo from '../../assets/tkLogo.svg'
import { appSlackLink, documentationLink } from '../../util/config'
import { env } from '../../util/env'
import { theme } from '../../util/theme'

const sidebarStyling = {
  sidebarContainer: css`
    position: fixed;
    width: 190px;
    height: 100%;
    background-color: ${theme.primary};
    @media only screen and (max-width: 768px) {
      width: 0px;
    }
  `,
  brand: css`
    display: flex;
    flex-direction: column;
    padding: 0rem;
    margin-top: 0.5rem;
  `,
  brandSandBox: css`
    cursor: 'help';
  `,
  logoLinkStyle: css`
    text-decoration: none;
    text-align: center;
  `,
  divider: css`
    width: 85%;
    background-color: #ffffff;
    padding: 0.3px;
    margin-top: 2.2rem;
  `,
}

const Brand = () => (
  <div className={sidebarStyling.brand}>
    <Link className={sidebarStyling.logoLinkStyle} to='/'>
      <Heading
        className={css`
          color: white;
          margin-top: 1rem;
          margin-left: 5px;
          margin-bottom: 2rem;
        `}
        size='small'
      >
        <img className={css({ padding: '1rem' })} src={TkLogo} />
        Teamkatalog
      </Heading>
    </Link>

    {env.isSandbox && (
      <div className={sidebarStyling.brandSandBox}>
        <Tooltip
          content='Dette er et sandkassemiljø og ikke den ekte teamkatalogen'
          placement='bottom'
        >
          <Heading
            className={css`
              color: red;
              margin-top: 0;
              margin-left: 5px;
              margin-bottom: 0;
            `}
            size='small'
          >
            <FontAwesomeIcon icon={faExclamationTriangle} /> Sandbox
          </Heading>
        </Tooltip>
      </div>
    )}
  </div>
)

const NavItem = (properties: { to: string; text: string }) => (
  <Link
    className={css`
      text-decoration: none;
      color: white;
    `}
    to={properties.to}
  >
    <div
      className={css`
        display: flex;
        align-items: center;
        margin-top: 1rem;
      `}
    >
      <div
        className={css`
          margin-right: 0.7rem;
        `}
      >
        <FontAwesomeIcon
          color='white'
          icon={
            useLocation()
              .pathname.split('/')[1]
              .includes(properties.to.split('/')[1])
              ? faChevronDown
              : faChevronRight
          }
          size='lg'
        />
      </div>

      <BodyShort color='white'>{properties.text}</BodyShort>
    </div>
  </Link>
)

const Sidebar = () => {
  return (
    <div className={sidebarStyling.sidebarContainer}>
      <Brand />

      <div
        className={css`
          padding-left: 1rem;
        `}
      >
        <NavItem text='Områder' to='/area' />
        <NavItem text='Klynger' to='/cluster' />
        <NavItem text='Team' to='/team' />
        <NavItem text='Fyrstikkalléen' to='/location/FA1' />
        <div className={sidebarStyling.divider} />
        <NavItem text='Organisasjon' to='/orgNav' />
      </div>

      <div
        className={css`
          position: absolute;
          bottom: 0;
          width: 100%;
        `}
      >
        <div
          className={css`
            display: flex;
            justify-content: center;
          `}
        >
          <div
            className={css`
              padding-bottom: 1rem;
              width: 40%;
            `}
          >
            <img alt='NAV logo' src={NavLogo} width='100%' />
          </div>
        </div>
        <div
          className={css`
            display: flex;
            justify-content: center;
            padding-bottom: 10px;
            align-items: center;
          `}
        >
          <a
            className={css`
              text-decoration: none;
            `}
            href={'/tree'}
            rel='noopener noreferrer'
            target='_blank'
          >
            <BodyShort
              className={css`
                margin-left: 6px;
                color: white;
                text-decoration: none;
              `}
            >
              Visualisering av team
            </BodyShort>
          </a>
        </div>
        <a
          className={css`
            text-decoration: none;
          `}
          href={appSlackLink}
          rel='noopener noreferrer'
          target='_blank'
        >
          <div
            className={css`
              display: flex;
              justify-content: center;
              padding-bottom: 10px;
              align-items: center;
            `}
          >
            <img alt='slack logo' src={SlackLogo} width='60px' />
            <BodyShort
              className={css`
                color: white;
              `}
            >
              #teamkatalogen{' '}
            </BodyShort>
          </div>
        </a>
        <div
          className={css`
            display: flex;
            justify-content: center;
            padding-bottom: 10px;
            align-items: center;
          `}
        >
          <Tooltip content={`Versjon: ${env.githubVersion}`}>
            <a>
              {' '}
              <FontAwesomeIcon
                color={`#${env.githubVersion.slice(0, 6)}`}
                icon={faCodeBranch}
              />
            </a>
          </Tooltip>
          <a
            className={css`
              text-decoration: none;
            `}
            href={documentationLink}
            rel='noopener noreferrer'
            target='_blank'
          >
            <BodyShort
              className={css`
                margin-left: 6px;
                color: white;
              `}
            >
              Dokumentasjon{' '}
            </BodyShort>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
