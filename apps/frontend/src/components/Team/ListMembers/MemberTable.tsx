import { useTable } from '../../../util/hooks'
import { Resource, TeamMember } from '../../../constants'
import { Cell, HeadCell, Row, Table } from '../../common/Table'
import { UserImage } from '../../common/UserImage'
import { intl } from '../../../util/intl/intl'
import * as React from 'react'
import RouteLink from '../../common/RouteLink'

type TeamMemberExt = TeamMember & Partial<Resource>

export const MemberTable = (props: { members: TeamMember[] }) => {
  const [table, sortColumn] = useTable<TeamMemberExt, keyof TeamMemberExt>(props.members.map(m => ({...m, ...m.resource})), {
      useDefaultStringCompare: true,
      initialSortColumn: 'fullName',
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
          <HeadCell title='Navn' column='fullName' tableState={[table, sortColumn]}/>
          <HeadCell title='Ident' column='navIdent' tableState={[table, sortColumn]}/>
          <HeadCell title='Type' column='resourceType' tableState={[table, sortColumn]}/>
          <HeadCell title='Roller' column='roles' tableState={[table, sortColumn]}/>
          <HeadCell title='Annet' column='description' tableState={[table, sortColumn]}/>
          <HeadCell title='Epost' column='email' tableState={[table, sortColumn]}/>
        </>
      }
    >
      {table.data.map((member: TeamMember) =>
        <Row key={member.navIdent}>
          <Cell $style={{maxWidth: '40px'}}>
            <UserImage ident={member.navIdent} maxWidth='40px'/>
          </Cell>
          <Cell>
            <RouteLink href={`/resource/${member.navIdent}`}>
              {member.resource.fullName}
            </RouteLink>
          </Cell>
          <Cell>
            {member.navIdent}
          </Cell>
          <Cell>
            {intl[member.resource.resourceType!]}
          </Cell>
          <Cell>
            {member.roles.map(r => intl[r]).join(", ")}
          </Cell>
          <Cell>
            {member.description}
          </Cell>
          <Cell>
            <span style={{wordBreak: 'break-all'}}>{member.resource.email}</span>
          </Cell>
        </Row>
      )}
    </Table>
  )
}
