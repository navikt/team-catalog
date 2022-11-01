import { css } from '@emotion/css'
import { Button } from '@navikt/ds-react'
import { Dropdown } from '@navikt/ds-react-internal'
import { intl } from '../../util/intl/intl'

const adminButtonStyle = css`
  margin-right: 2rem;
`

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

const AdminDropdown = () => {
  return (
    <div className={adminButtonStyle}>
      <Dropdown>
        <Button as={Dropdown.Toggle} className={dropdownStyle}>
          Admin
        </Button>
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
  )
}

export default AdminDropdown
