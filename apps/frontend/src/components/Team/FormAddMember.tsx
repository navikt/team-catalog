import * as React from 'react'
import { useState } from 'react'
import { Block } from 'baseui/block'
import { Input, SIZE } from 'baseui/input'
import Button from '../common/Button'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Select, Value } from 'baseui/select'
import { useResourceSearch } from '../../api/resourceApi'
import { theme } from '../../util'
import { Member } from '../../constants'
import { Error } from '../common/ModalSchema'

export const emptyMember = {
  navIdent: '',
  name: '',
  role: ''
} as Member

type FieldsAddMemberProps = {
  index: number,
  onChangeMember: (member?: Member) => void,
  add: () => void
}

const isEmpty = (member: Member) => !member.navIdent && !member.role

const FormAddMember = (props: FieldsAddMemberProps) => {
  const {onChangeMember, index, add} = props
  const [resource, setResource] = useState<Value>([])
  const [searchResult, setResourceSearch, loading] = useResourceSearch()

  const [member, setMember] = useState<Member>({...emptyMember});

  const update = (val: Member) => {
    if (isEmpty(val)) {
      onChangeMember(undefined)
    } else {
      onChangeMember(val)
    }
    setMember(val)
  }

  const submit = () => {
    setResourceSearch('')
    setMember({...emptyMember})
    setResource([])
    add()
  }

  return (
    <>
      <Block display="flex" justifyContent="space-between" width="100%">
        <Block width="40%" marginRight={theme.sizing.scale400}>
          <Select
            options={!loading ? searchResult : []}
            filterOptions={options => options}
            maxDropdownHeight="400px"
            onChange={({value}) => {
              setResource(value)
              const val = {...member}
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
        <Block width={"30%"}>
          <Input type="text" size={SIZE.default} value={member.role}
                 onChange={e => update({...member, role: (e.target as HTMLInputElement).value})}
                 placeholder="Rolle"/>
        </Block>

        <Button tooltip="Legg til medlem"
                kind="minimal" type="button"
                icon={faPlus}
                onClick={submit}>
          Legg til medlem
        </Button>
      </Block>
      <Error fieldName={`members[${index}].navIdent`} fullWidth={true}/>
      <Error fieldName={`members[${index}].role`} fullWidth={true}/>
    </>
  )
}

export default FormAddMember
