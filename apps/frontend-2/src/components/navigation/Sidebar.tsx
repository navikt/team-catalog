import { css } from "@emotion/css"
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Heading, Tooltip, BodyShort } from "@navikt/ds-react"
import {colors}  from '../../util/theme'
import TkLogo from '../../assets/tkLogo.svg'
import NavLogo from '../../assets/navlogo.svg'
import { Link, useLocation } from "react-router-dom"

const sidebarStyling = {
    sidebarContainer: css`
        position: fixed;
        width: 180px;
        height: 100%;
        background-color: ${colors.primary};
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
      background-color: #FFFFFF;
      padding: 0.3px;
      margin-top: 2.2rem;
    `,
}


const Brand = () => (
    <div className={sidebarStyling.brand}>
      <Link to="/" className={sidebarStyling.logoLinkStyle}>
        <Heading size="small" className={css`color: white; margin-top: 1rem; margin-left: 5px; margin-bottom: 2rem;`}>
          <img src={TkLogo} className={css({padding: "1rem"})}/>
          Teamkatalog
        </Heading>
      </Link>
      
      {import.meta.env.isSandbox && (
        <div className={sidebarStyling.brandSandBox}>
          <Tooltip content="Dette er et sandkassemiljø og ikke den ekte teamkatalogen" placement="bottom">
            <Heading size="small" className={css`color: red; margin-top: 0; margin-left: 5px; margin-bottom: 0;`}>
              <FontAwesomeIcon icon={faExclamationTriangle} /> Sandbox
            </Heading>
          </Tooltip>
        </div>
      )}
    </div>
)

const NavItem = (props: {to: string, text: string}) => (
  <Link to={props.to} className={css`text-decoration: none; color: white;`}>
    <div className={css`display: flex; align-items: center; margin-top: 1rem;`}>
      <div className={css`margin-right: 0.7rem;`}>
        <FontAwesomeIcon icon={useLocation().pathname.split('/')[1].includes(props.to.split('/')[1]) ? faChevronDown : faChevronRight} color="white" size="lg" />
      </div>

      <BodyShort color="white">{props.text}</BodyShort>
    </div>
  </Link>
)

const Sidebar = () => {

    return (
        <div className={sidebarStyling.sidebarContainer}>
            <Brand/>

            <div className={css`padding-left: 1rem;`}>
              <NavItem to="/area" text="Områder" />
              <NavItem to="/cluster" text="Klynger" />
              <NavItem to="/team" text="Team" />
              <NavItem to="/location/FA1" text="Fyrstikkalléen" />
              <div className={sidebarStyling.divider} />
              <NavItem to="/orgNav" text="Organisasjon" />
            </div>

            <div className={css`position:"absolute"; bottom:"0"; width:"100%";`} >
              <div className={css`display: flex; justify-content: center;`}>
                <div className={css`padding-bottom:"1rem"; width:"30%";`} >
                  <img src={NavLogo} alt="NAV logo" width="100%" />
                </div>
              </div>
            </div>
        </div>
    )
}

export default Sidebar