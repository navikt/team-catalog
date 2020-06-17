import { Member, Resource } from '../../../constants'
import { Cell, Row, Table } from '../../common/Table'
import { UserImage } from '../../common/UserImage'
import { intl } from '../../../util/intl/intl'
import * as React from 'react'
import { useState } from 'react'
import RouteLink from '../../common/RouteLink'

type TeamMemberExt = Member & Partial<Resource>

export const MemberTable = (props: { members: Member[] }) => {
  const [mems] = useState<TeamMemberExt[]>(props.members.map(m => ({...m, ...m.resource})))

  return (
    <Table
      emptyText={''}
      width={'100%'}
      data={mems}
      config={{
        useDefaultStringCompare: true,
        initialSortColumn: 'fullName',
        sorting: {
          navIdent: (a, b) => parseInt(a.navIdent.substr(1)) - parseInt(b.navIdent.substr(1)),
          roles: (a, b) => a.roles[0].localeCompare(b.roles[0])
        }
      }}
      headers={[
        {title: 'Bilde', $style: {maxWidth: '40px'}},
        {title: 'Navn', column: 'fullName'},
        {title: 'Ident', column: 'navIdent'},
        {title: 'Type', column: 'resourceType'},
        {title: 'Roller', column: 'roles'},
        {title: 'Annet', column: 'description'},
        {title: 'Epost', column: 'email'}
      ]}
      render={table => table.data.map((member: Member) =>
        <Row key={member.navIdent}>
          <Cell $style={{maxWidth: '40px'}}>
            <UserImage ident={member.navIdent} size='40px'/>
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
      )}/>
  )
}
