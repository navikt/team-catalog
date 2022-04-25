import * as React from 'react'
import { theme } from '../../../util'
import { Block, BlockProps } from 'baseui/block'
import { HeadingXSmall, ParagraphXSmall } from 'baseui/typography'
import NavLogo from '../../../resources/navlogo.svg'
import { StyledLink } from 'baseui/link'
import NavItem from './NavItem'
import SlackLogo from '../../../resources/Slack_Monochrome_White.svg'
import { StatefulTooltip } from 'baseui/tooltip'
import { env } from '../../../util/env'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { appSlackLink, documentationLink, githubRepo, teamVisualizationLink } from '../../../util/config'

const sideBarProps: BlockProps = {
  position: 'fixed',
  height: '100%',
  width: ['0', '0', '180px', '180px'],
  backgroundColor: theme.colors.primaryA,
}

const items: BlockProps = {
  paddingLeft: '1rem',
}

const Brand = () => (
  <Block display="flex" flexDirection={'column'} padding="1rem" marginTop="1rem">
    <StyledLink style={{ textDecoration: 'none', textAlign: 'center' }} href="/">
      <HeadingXSmall color="white" marginTop="1rem" marginLeft="5px" marginBottom="2rem">
        Teamkatalog
      </HeadingXSmall>
    </StyledLink>
    {env.isSandbox && (
      <Block $style={{ cursor: 'help' }}>
        <StatefulTooltip content="Dette er et sandkassemiljø og ikke den ekte teamkatalogen">
          <HeadingXSmall color="red" marginTop="0" marginLeft="5px" marginBottom="0">
            <FontAwesomeIcon icon={faExclamationTriangle} /> Sandbox
          </HeadingXSmall>
        </StatefulTooltip>
      </Block>
    )}
  </Block>
)

const SideBar = () => {
  return (
    <Block {...sideBarProps}>
      <Brand />
      <Block {...items}>
        <NavItem to="/area" text="Områder" />
        <NavItem to="/cluster" text="Klynger" />
        <NavItem to="/team" text="Team" />
        <NavItem to="/location/FA1" text="Fyrstikkalléen" />
        <Block width="85%" backgroundColor={theme.colors.white} padding="0.3px" marginTop="35px" />
        <NavItem to="/orgNav" text="Organisasjon" />
      </Block>
      <Block position="absolute" bottom="0" width="100%">
        <Block display="flex" justifyContent="center">
          <Block paddingBottom={theme.sizing.scale600} width="40%">
            <img src={NavLogo} alt="NAV logo" width="100%" />
          </Block>
        </Block>
        <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
          <a href={teamVisualizationLink} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
            <ParagraphXSmall marginLeft={theme.sizing.scale200} color={theme.colors.white}>
              Visualisering av team
            </ParagraphXSmall>
          </a>
        </Block>
        <a href={appSlackLink} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
          <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
            <img src={SlackLogo} width="60px" alt="slack logo" />
            <ParagraphXSmall color={theme.colors.white}>#teamkatalogen </ParagraphXSmall>
          </Block>
        </a>
        <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
          <StatefulTooltip content={`Versjon: ${env.githubVersion}`}>
            <a href={githubRepo} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon color={`#${env.githubVersion.substr(0, 6)}`} icon={faCodeBranch} />
            </a>
          </StatefulTooltip>
          <a href={documentationLink} style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
            <ParagraphXSmall marginLeft={theme.sizing.scale200} color={theme.colors.white}>
              Dokumentasjon{' '}
            </ParagraphXSmall>
          </a>
        </Block>
      </Block>
    </Block>
  )
}

export default SideBar
