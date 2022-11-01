import { css } from '@emotion/css'
import { faCodeBranch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Heading, Tooltip, BodyShort } from '@navikt/ds-react'
import { theme } from '../../util/theme'
import TkLogo from '../../assets/tkLogo.svg'
import NavLogo from '../../assets/navlogo.svg'
import SlackLogo from '../../assets/Slack_Monochrome_White.svg'
import { Link, useLocation } from 'react-router-dom'
import { appSlackLink, documentationLink } from '../../util/config'
import { env } from '../../util/env'

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
    <Link to='/' className={sidebarStyling.logoLinkStyle}>
      <Heading
        size='small'
        className={css`
          color: white;
          margin-top: 1rem;
          margin-left: 5px;
          margin-bottom: 2rem;
        `}>
        <img src={TkLogo} className={css({ padding: '1rem' })} />
        Teamkatalog
      </Heading>
    </Link>

    {env.isSandbox && (
      <div className={sidebarStyling.brandSandBox}>
        <Tooltip content='Dette er et sandkassemiljø og ikke den ekte teamkatalogen' placement='bottom'>
          <Heading
            size='small'
            className={css`
              color: red;
              margin-top: 0;
              margin-left: 5px;
              margin-bottom: 0;
            `}>
            <FontAwesomeIcon icon={faExclamationTriangle} /> Sandbox
          </Heading>
        </Tooltip>
      </div>
    )}
  </div>
)

const NavItem = (props: { to: string; text: string }) => (
  <Link
    to={props.to}
    className={css`
      text-decoration: none;
      color: white;
    `}>
    <div
      className={css`
        display: flex;
        align-items: center;
        margin-top: 1rem;
      `}>
      <div
        className={css`
          margin-right: 0.7rem;
        `}>
        <FontAwesomeIcon
          icon={useLocation().pathname.split('/')[1].includes(props.to.split('/')[1]) ? faChevronDown : faChevronRight}
          color='white'
          size='lg'
        />
      </div>

      <BodyShort color='white'>{props.text}</BodyShort>
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
        `}>
        <NavItem to='/area' text='Områder' />
        <NavItem to='/cluster' text='Klynger' />
        <NavItem to='/team' text='Team' />
        <NavItem to='/location/FA1' text='Fyrstikkalléen' />
        <div className={sidebarStyling.divider} />
        <NavItem to='/orgNav' text='Organisasjon' />
      </div>

      <div
        className={css`
          position: absolute;
          bottom: 0;
          width: 100%;
        `}>
        <div
          className={css`
            display: flex;
            justify-content: center;
          `}>
          <div
            className={css`
              padding-bottom: 1rem;
              width: 40%;
            `}>
            <img src={NavLogo} alt='NAV logo' width='100%' />
          </div>
        </div>
        <div
          className={css`
            display: flex;
            justify-content: center;
            padding-bottom: 10px;
            align-items: center;
          `}>
          <a
            href={'/tree'}
            className={css`
              text-decoration: none;
            `}
            target='_blank'
            rel='noopener noreferrer'>
            <BodyShort
              className={css`
                margin-left: 6px;
                color: white;
                text-decoration: none;
              `}>
              Visualisering av team
            </BodyShort>
          </a>
        </div>
        <a
          href={appSlackLink}
          className={css`
            text-decoration: none;
          `}
          target='_blank'
          rel='noopener noreferrer'>
          <div
            className={css`
              display: flex;
              justify-content: center;
              padding-bottom: 10px;
              align-items: center;
            `}>
            <img src={SlackLogo} width='60px' alt='slack logo' />
            <BodyShort
              className={css`
                color: white;
              `}>
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
          `}>
          <Tooltip content={`Versjon: ${env.githubVersion}`}>
            <a>
              {' '}
              <FontAwesomeIcon color={`#${env.githubVersion.substr(0, 6)}`} icon={faCodeBranch} />
            </a>
          </Tooltip>
          <a
            href={documentationLink}
            className={css`
              text-decoration: none;
            `}
            target='_blank'
            rel='noopener noreferrer'>
            <BodyShort
              className={css`
                margin-left: 6px;
                color: white;
              `}>
              Dokumentasjon{' '}
            </BodyShort>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
