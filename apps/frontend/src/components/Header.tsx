import * as React from 'react'
import { useEffect, useState } from 'react'
import { ALIGN, HeaderNavigation, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList, } from 'baseui/header-navigation'
import { Block, BlockProps } from 'baseui/block'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import MainSearch from './MainSearch'
import { user } from '../services/User'

const HeaderImpl = (props: RouteComponentProps) => {
  const [url, setUrl] = useState(window.location.href)
  
  useEffect(() => setUrl(window.location.href), [props.location.pathname])


  return (
    <Block>
      <HeaderNavigation overrides={{Root: {style: {paddingBottom: 0, borderBottomStyle: 'none'}}}}>
        <NavigationList $align={ALIGN.left}>
          <NavigationItem $style={{paddingLeft: 0}}>
            <MainSearch />
          </NavigationItem>
        </NavigationList>

        <NavigationList $align={ALIGN.center}/>

        {/* <NavigationList $align={ALIGN.right}>
          {user.isAdmin() && (
            <NavigationItem $style={{paddingLeft: 0}}>
              <AdminOptions/>
            </NavigationItem>
          )}

          <NavigationItem $style={{paddingLeft: 0}}>
            <LangDropdown setLang={props.setLang}/>
          </NavigationItem>

          {!user.isLoggedIn() && (
            <NavigationItem $style={{paddingLeft: 0}}>
              <LoginButton location={url}/>
            </NavigationItem>
          )}
          {user.isLoggedIn() && (
            <NavigationItem $style={{paddingLeft: 0}}>
              <LoggedInHeader location={url}/>
            </NavigationItem>
          )}
        </NavigationList> */}
      </HeaderNavigation>
    </Block>
  )
}

export default withRouter(HeaderImpl)
