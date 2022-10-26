import { css } from '@emotion/css'
import { Button, Link, Search } from '@navikt/ds-react'
import { Dropdown } from '@navikt/ds-react-internal'

import { user } from '../services/User'
import { intl } from '../util/intl/intl'
import { UserImage } from './UserImage'

const headerStyle = css`
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
`

const searchBarStyle = css`
  width: 700px;
`

const headerRightSideStyle = css`
  display: flex;
  align-self: baseline;
`

const loggedInBurgerMenu = css`
  display: flex;
  align-items: center;
`

const adminButtonStyle = css`
  margin-right: 2rem;
`

const Header = () => {
  console.log(user.isLoggedIn())
  console.log(user, 'user_header')
  return (
    <div className={headerStyle}>
      <form className={searchBarStyle}>
        <Search
          label='Søk alle NAV sine sider'
          size='medium'
          variant='secondary'
        />
      </form>
      <div className={headerRightSideStyle}>
        {user.isAdmin() && (
          <div className={adminButtonStyle}>
            <Dropdown>
              <Button as={Dropdown.Toggle}>Admin</Button>
              <Dropdown.Menu placement='bottom'>
                <Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.GroupedList.Item>
                    <a href='/admin/audit'>{intl.audit}</a>
                  </Dropdown.Menu.GroupedList.Item>
                  <Dropdown.Menu.GroupedList.Item>
                    <a href='/admin/maillog'>{intl.mailLog}</a>
                  </Dropdown.Menu.GroupedList.Item>
                  <Dropdown.Menu.GroupedList.Item>
                    <a href='/admin/settings'>{intl.settings}</a>
                  </Dropdown.Menu.GroupedList.Item>
                </Dropdown.Menu.GroupedList>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}

        {!user.isLoggedIn() && (
          <div>
            {/* <Link href={`/login?redirect_uri=${props.location}`}>Logg inn</Link> */}
            <Link href={'test'}>Logg inn</Link>
          </div>
        )}
        {user.isLoggedIn() && (
          <div className={loggedInBurgerMenu}>
            <UserImage disableRefresh ident={'158887'} size='30px' />
            <Dropdown>
              <Button as={Dropdown.Toggle} variant='tertiary'>
                {user.getIdent()}
              </Button>
              <Dropdown.Menu placement='bottom'>
                <Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.GroupedList.Heading>
                    Navn: {user.getName()}
                  </Dropdown.Menu.GroupedList.Heading>
                  <Dropdown.Menu.GroupedList.Item>
                    <a href={`/resource/${user.getIdent()}`}>Min side</a>
                  </Dropdown.Menu.GroupedList.Item>
                  <Dropdown.Menu.GroupedList.Item>
                    <a href={`/user/notifications`}>Mine varsler</a>
                  </Dropdown.Menu.GroupedList.Item>
                  <Dropdown.Menu.GroupedList.Item>
                    {/* <a href={`/logout?redirect_uri=${props.location}`}>Logg ut</a> */}
                  </Dropdown.Menu.GroupedList.Item>
                </Dropdown.Menu.GroupedList>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
