import * as React from 'react'
import { useEffect, useState } from 'react'
import { ALIGN, HeaderNavigation, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList, } from 'baseui/header-navigation'
import { Block, BlockProps } from 'baseui/block'
import { Button } from 'baseui/button'
import { StatefulPopover } from 'baseui/popover'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { user } from '../services/User'
import { StyledLink } from 'baseui/link'
import { env } from '../util/env'
import { useAwait } from '../util/hooks'
import { paddingAll } from './Style'
import { theme } from '../util'
import { Label2 } from 'baseui/typography'
import { UserImage } from './common/UserImage'
import { intl } from '../util/intl/intl'
import { StatefulMenu } from 'baseui/menu'
import { TriangleDown } from 'baseui/icon'
import MainSearch from './search/MainSearch'
import BurgerMenu from './Burger'


const LoginButton = (props: { location: string }) => {
  return (
    <StyledLink href={`${env.teamCatalogBaseUrl}/login?redirect_uri=${props.location}`}>
      <Button $style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        Logg inn
      </Button>
    </StyledLink>
  )
}

const LoggedInHeader = (props: { location: string }) => {
  const blockStyle: BlockProps = {
    display: 'flex',
    width: '100%',
    ...paddingAll(theme.sizing.scale100)
  }
  return (
    <StatefulPopover
      content={
        <Block padding={theme.sizing.scale400}>
          <Label2 {...blockStyle}>Navn: {user.getName()}</Label2>
          {/* <Label2 {...blockStyle}>Grupper: {user.getGroupsHumanReadable().join(', ')}</Label2> */}
          <Block {...blockStyle}>
            <StyledLink href={`${env.teamCatalogBaseUrl}/logout?redirect_uri=${props.location}`}>
              Logg ut
            </StyledLink>
          </Block>
        </Block>
      }
    >
      <Button kind="tertiary" startEnhancer={() => <UserImage ident={user.getIdent()} maxWidth='20px' />}>{user.getIdent()}</Button>
    </StatefulPopover>
  )
}

const AdminOptionsImpl = (props: RouteComponentProps<any>) => {
  const pages = [
    { label: intl.audit, href: '/admin/audit' },
    { label: intl.settings, href: '/admin/settings' }
  ]
  return (
    <StatefulPopover
      content={({ close }) =>
        <StatefulMenu
          items={pages}
          onItemSelect={select => {
            select.event?.preventDefault()
            close()
            props.history.push(select.item.href)
          }}
        />
      }>
      <Button endEnhancer={() => <TriangleDown size={24} />} kind="tertiary">
        {intl.administrate}
      </Button>
    </StatefulPopover>
  )
}
const AdminOptions = withRouter(AdminOptionsImpl)


const Header = (props: RouteComponentProps) => {
  const [url, setUrl] = useState(window.location.href)

  useAwait(user.wait())

  useEffect(() => setUrl(window.location.href), [props.location.pathname])

  return (
    <Block>
      <HeaderNavigation overrides={{ Root: { style: { paddingBottom: 0, borderBottomStyle: 'none' } } }}>
        <Block display={["block", "block", "none", "none"]}>
          <BurgerMenu />

        </Block>


        <NavigationList $align={ALIGN.left}>
          <NavigationItem $style={{ paddingLeft: 0 }}>
            <MainSearch />
          </NavigationItem>
        </NavigationList>

        <NavigationList $align={ALIGN.center} />

        <NavigationList $align={ALIGN.right}>
          {user.isAdmin() && (
            <NavigationItem $style={{ paddingLeft: 0 }}>
              <AdminOptions />
            </NavigationItem>
          )}

          {!user.isLoggedIn() && (
            <NavigationItem $style={{ paddingLeft: 0 }}>
              <LoginButton location={url} />
            </NavigationItem>
          )}
          {user.isLoggedIn() && (
            <NavigationItem $style={{ paddingLeft: 0 }}>
              <LoggedInHeader location={url} />
            </NavigationItem>
          )}
        </NavigationList>
      </HeaderNavigation>
    </Block>
  )
}

export default withRouter(Header)
