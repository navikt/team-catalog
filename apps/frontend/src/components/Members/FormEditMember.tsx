import * as React from 'react'
import {useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import {Input, SIZE} from 'baseui/input'
import {Option, Select, StatefulSelect} from 'baseui/select'
import {ResourceOption, useResourceSearch} from '../../api/resourceApi'
import {theme} from '../../util'
import {Member, MemberFormValues, TeamRole} from '../../constants'
import {useDebouncedState} from '../../util/hooks'
import {intl} from '../../util/intl/intl'
import {RenderTagList} from '../common/TagList'


type FieldsAddMemberProps = {
  member?: MemberFormValues,
  onChangeMember: (member?: MemberFormValues) => void,
  filterMemberSearch: (o: ResourceOption[]) => ResourceOption[]
}

const isEmpty = (member: Partial<Member>) => !member.navIdent && !member.roles?.length && !member.description

const memberToResource = (member: MemberFormValues): ResourceOption => ({
  id: member.navIdent,
  navIdent: member.navIdent,
  fullName: member.fullName,
  label: member.navIdent ? `${member.fullName} (${member.navIdent})` : '',
  email: '',
  resourceType: member.resourceType
})

export const rolesToOptions = (roles: TeamRole[]) => {
  return roles.map(r => ({id: r, label: intl[r]} as Option))
}

const FormEditMember = (props: FieldsAddMemberProps) => {
  const {onChangeMember, member} = props
  const [resource, setResource] = useState<ResourceOption[]>(member ? [memberToResource(member)] : [])
  const [roles, setRoles] = useState<TeamRole[]>((member && 'roles' in member && member.roles) || [])
  const [description, setDescription, descriptionValue] = useDebouncedState(member?.description || '', 400)

  const [searchResult, setResourceSearch, loading] = useResourceSearch()

  useEffect(() => {
    const reso = (resource.length ? resource[0] : {}) as ResourceOption
    const val: MemberFormValues = {
      navIdent: reso.id,
      description,
      roles,
      fullName: reso.fullName,
      resourceType: reso.resourceType,
    }
    onChangeMember(isEmpty(val) ? undefined : val)
  }, [resource, description, roles])


  return (
    <Block display="flex" flexWrap width="100%" marginTop={theme.sizing.scale200} marginBottom={theme.sizing.scale200}>
      <Block display="flex" justifyContent="space-between" width="100%">
        <Block width={"60%"} marginRight={theme.sizing.scale400}>
          <Select
            options={!loading ? props.filterMemberSearch(searchResult) : []}
            filterOptions={options => options}
            maxDropdownHeight="400px"
            onChange={({value}) => {
              setResource(value as ResourceOption[])
            }}
            onInputChange={async event => setResourceSearch(event.currentTarget.value)}
            value={resource}
            isLoading={loading}
            placeholder="Søk etter ansatte"
          />
        </Block>
        <Block width='40%'>
          <StatefulSelect
            disabled={!resource.length}
            options={rolesToOptions(Object.values(TeamRole).filter(r => roles.indexOf(r) < 0))}
            maxDropdownHeight="400px"
            onChange={({value}) => {
              setRoles(value.length ? [...roles, value[0].id as TeamRole] : roles)
            }}
            placeholder="Roller"
            overrides={{
              DropdownContainer: {
                style: {
                  width: '250px'
                }
              }
            }}
          />
        </Block>
      </Block>
      <Block display='flex' flexWrap width="100%" marginTop={theme.sizing.scale100} justifyContent='flex-end'>
        <RenderTagList list={roles.map(r => intl[r])} onRemove={(index: number) => {
          const spliced = [...roles]
          spliced.splice(index, 1)
          setRoles(spliced)
        }}/>
      </Block>
      <Block width="100%" marginTop={theme.sizing.scale100}>
        <Input type="text" size={SIZE.default} value={descriptionValue}
               onChange={e => setDescription((e.target as HTMLInputElement).value)}
               disabled={!resource.length}
               placeholder="Annet"/>
      </Block>
    </Block>
  )
}

export default FormEditMember
