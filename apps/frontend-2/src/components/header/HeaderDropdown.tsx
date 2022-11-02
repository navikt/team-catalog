import { css } from '@emotion/css'
import { Expand } from '@navikt/ds-icons'
import { Button } from '@navikt/ds-react'
import { Dropdown } from '@navikt/ds-react-internal'

import { user } from '../../services/User'

const dropdownStyle = css`
  background-color: #005077;
  color: white;
  text-decoration: underline;
  border-color: white;
  box-shadow: inset 0 0 0 1px white;
  border-radius: 8px;
  :focus {
    box-shadow: inset 0 0 0 2px white;
  }
  :hover {
    color: white;
    box-shadow: inset 0 0 0 2px white;
    background-color: #005077;
  }
`

const HeaderDropdown = () => {
  return (
    <Dropdown>
      <Button as={Dropdown.Toggle} className={dropdownStyle} icon={<Expand aria-hidden />} iconPosition='right' variant='secondary'>
        {user.getIdent()}
      </Button>
      <Dropdown.Menu placement='bottom'>
        <Dropdown.Menu.GroupedList>
          <Dropdown.Menu.GroupedList.Heading>Navn: {user.getName()}</Dropdown.Menu.GroupedList.Heading>
          <Dropdown.Menu.GroupedList.Item>
            <a href={`/resource/${user.getIdent()}`}>Min side</a>
          </Dropdown.Menu.GroupedList.Item>
          <Dropdown.Menu.GroupedList.Item>
            <a href={`/user/notifications`}>Mine varsler</a>
          </Dropdown.Menu.GroupedList.Item>
          <Dropdown.Menu.GroupedList.Item>{/* <a href={`/logout?redirect_uri=${props.location}`}>Logg ut</a> */}</Dropdown.Menu.GroupedList.Item>
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default HeaderDropdown
