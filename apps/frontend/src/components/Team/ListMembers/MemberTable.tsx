import { useTable } from '../../../util/hooks'
import { Member } from '../../../constants'
import { Cell, HeadCell, Row, Table } from '../../common/Table'
import { UserImage } from '../../common/UserImage'
import { intl } from '../../../util/intl/intl'
import * as React from 'react'
import RouteLink from '../../common/RouteLink'


export const MemberTable = (props: { members: Member[] }) => {
  const [table, sortColumn] = useTable<Member, keyof Member>(props.members, {
      useDefaultStringCompare: true,
      initialSortColumn: 'name',
      sorting: {
        navIdent: (a, b) => parseInt(a.navIdent.substr(1)) - parseInt(b.navIdent.substr(1)),
        roles: (a, b) => a.roles[0].localeCompare(b.roles[0])
      }
    }
  )

  return (
    <Table
      emptyText={''}
      width={'100%'}
      headers={
        <>
          <HeadCell title='Bilde' $style={{maxWidth: '40px'}}/>
          <HeadCell title='Navn' column='name' tableState={[table, sortColumn]}/>
          <HeadCell title='Ident' column='navIdent' tableState={[table, sortColumn]}/>
          <HeadCell title='Type' column='resourceType' tableState={[table, sortColumn]}/>
          <HeadCell title='Roller' column='roles' tableState={[table, sortColumn]}/>
          <HeadCell title='Annet' column='description' tableState={[table, sortColumn]}/>
          <HeadCell title='Epost' column='email' tableState={[table, sortColumn]}/>
        </>
      }
    >
      {table.data.map((member: Member) =>
        <Row key={member.navIdent}>
          <Cell $style={{maxWidth: '40px'}}>
            <UserImage ident={member.navIdent} maxWidth='40px'/>
          </Cell>
          <Cell>
            <RouteLink href={`/resource/${member.navIdent}`}>
              {member.name}
            </RouteLink>
          </Cell>
          <Cell>
            {member.navIdent}
          </Cell>
          <Cell>
            {intl[member.resourceType]}
          </Cell>
          <Cell>
            {member.roles.map(r => intl[r]).join(", ")}
          </Cell>
          <Cell>
            {member.description}
          </Cell>
          <Cell>
            <span style={{wordBreak: 'break-all'}}>{member.email}</span>
          </Cell>
        </Row>
      )}
    </Table>
  )
}
