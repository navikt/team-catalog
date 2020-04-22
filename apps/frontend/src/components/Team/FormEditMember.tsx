import * as React from 'react'
import {useState} from 'react'
import {Block} from 'baseui/block'
import {Input, SIZE} from 'baseui/input'
import {Option, Select, Value} from 'baseui/select'
import {useResourceSearch} from '../../api/resourceApi'
import {theme} from '../../util'
import {Member} from '../../constants'

export const emptyMember = {
  navIdent: '',
  name: '',
  role: ''
} as Member

type FieldsAddMemberProps = {
  member?: Member,
  editIndex: number,
  onChangeMember: (member?: Member) => void,
  members: Member[]
}

const isEmpty = (member: Member) => !member.navIdent && !member.role

const FormEditMember = (props: FieldsAddMemberProps) => {
  const {onChangeMember,member} = props
  const [resource, setResource] = useState<Value>(member ? [{
    id: member.navIdent,
    nam: member.name,
    display: member.navIdent ? `${member.name} (${member.navIdent})` : ''
  }] : [])
  const [searchResult, setResourceSearch, loading] = useResourceSearch()

  const [memberState, setMemberState] = useState<Member>(member || {...emptyMember});

  const update = (val: Member) => {
    if (isEmpty(val)) {
      onChangeMember(undefined)
    } else {
      onChangeMember(val)
    }
    setMemberState(val)
  }

  const filterAlreadyAddedMembersFromSelectOptions = (options:Option[]) => {
    return options.filter(option=> !props.members.map(m => m.navIdent).includes(option.id?option.id.toString():""))
  }

  return (
    <>
      <Block display="flex" justifyContent="space-between" width="100%">
        <Block width="60%" marginRight={theme.sizing.scale400}>
          <Select
            options={!loading ? filterAlreadyAddedMembersFromSelectOptions(searchResult) : []}
            filterOptions={options => options}
            maxDropdownHeight="400px"
            onChange={({value}) => {
              setResource(value)
              const val = {...memberState}
              val.name = value.length > 0 ? value[0].name : ''
              val.navIdent = value.length > 0 ? value[0].id as string : ''
              update(val)
            }}
            onInputChange={async event => setResourceSearch(event.currentTarget.value)}
            value={resource}
            isLoading={loading}
            placeholder="Søk etter ansatte"
            labelKey="display"
          />
        </Block>
        <Block width={"40%"}>
          <Input type="text" size={SIZE.default} value={memberState.role}
                 onChange={e => {
                   update({...memberState, role: (e.target as HTMLInputElement).value})
                 }}
                 placeholder="Rolle *"/>
        </Block>
      </Block>
    </>
  )
}

export default FormEditMember
