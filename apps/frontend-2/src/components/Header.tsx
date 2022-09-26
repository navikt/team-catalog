import { css } from '@emotion/css'
import { Button, Search } from '@navikt/ds-react'
import { Dropdown } from '@navikt/ds-react-internal'
import { intl } from '../util/intl/intl'

const headerStyle = css`
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
`

const searchBarStyle = css`
  width: 500px;
`

const headerRightSideStyle = css`
  display: flex;
  align-self: baseline;
`

const Header = () => {
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
        <div>
          {/* <UserImage ident={'158887'} size='20px' disableRefresh /> */}
          <Dropdown>
            <Button as={Dropdown.Toggle} variant='tertiary'>
              H158887
            </Button>
            <Dropdown.Menu placement='bottom'>
              <Dropdown.Menu.GroupedList>
                <Dropdown.Menu.GroupedList.Heading>
                  Navn: Harnes, Andreas
                </Dropdown.Menu.GroupedList.Heading>
                <Dropdown.Menu.GroupedList.Item>
                  <a href={`/resource/${user.getIdent()}`}>Min side</a>
                </Dropdown.Menu.GroupedList.Item>
                <Dropdown.Menu.GroupedList.Item>
                  <a href={`/user/notifications`}>Mine varsler</a>
                </Dropdown.Menu.GroupedList.Item>
                <Dropdown.Menu.GroupedList.Item>
                  <a href={`/logout?redirect_uri=${props.location}`}>Logg ut</a>
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}

export default Header
