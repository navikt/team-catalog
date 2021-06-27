import * as React from 'react'
import {useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import {Input, SIZE} from 'baseui/input'
import {Option, Select, StatefulSelect} from 'baseui/select'
import {ResourceOption, useResourceSearch} from '../../api/resourceApi'
import {theme} from '../../util'
import {Owner,  OwnerRole,  ProductAreaOwnerFormValues} from '../../constants'
import {useDebouncedState} from '../../util/hooks'
import {intl} from '../../util/intl/intl'
import {RenderTagList} from '../common/TagList'


type FieldsAddOwnerProps = {
  owner?: ProductAreaOwnerFormValues,
  onChangeOwner: (owner?: ProductAreaOwnerFormValues) => void,
  filterMemberSearch: (o: ResourceOption[]) => ResourceOption[]
}

const isEmpty = (owner: Partial<Owner>) => !owner.navIdent && !owner.role && !owner.description

const ownerToResource = (owner: ProductAreaOwnerFormValues): ResourceOption => ({
  id: owner.navIdent,
  navIdent: owner.navIdent,
  fullName: owner.fullName,
  label: owner.navIdent ? `${owner.fullName} (${owner.navIdent})` : '',
  email: '',
  resourceType: owner.resourceType
})

export const rolesToOptions = (roles: OwnerRole[]) => {
  return roles.map(r => ({id: r, label: intl[r]} as Option))
}

const FormEditOwner = (props: FieldsAddOwnerProps) => {
  const {onChangeOwner, owner} = props
  const [resource, setResource] = useState<ResourceOption[]>(owner ? [ownerToResource(owner)] : [])
  const [roles, setRoles] = useState<OwnerRole>(owner && owner.role || OwnerRole.OWNER_MEMBER)
  const [description, setDescription, descriptionValue] = useDebouncedState(owner?.description || '', 400)

  const [searchResult, setResourceSearch, loading] = useResourceSearch()

  useEffect(() => {
    const reso = (resource.length ? resource[0] : {}) as ResourceOption
    const val: ProductAreaOwnerFormValues = {
      navIdent: reso.id,
      description,
      role: roles,
      fullName: reso.fullName,
      resourceType: reso.resourceType,
    }
    onChangeOwner(isEmpty(val) ? undefined : val)
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
            // options={rolesToOptions(Object.values(OwnerRole).filter(r => role.indexOf(r) < 0))}
            options={rolesToOptions(Object.values(OwnerRole))}

            maxDropdownHeight="400px"
            onChange={({value}) => {
              console.log({feditownervalue: value});
              
              // setRole(value.length ? [...role, value[0].id as OwnerRole] : role)
              setRoles(value ? OwnerRole.OWNER_LEAD : roles)
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
        {/* <RenderTagList list={[intl[role]]} onRemove={(index: number) => {
          // const spliced = [...role]
          // spliced.splice(index, 1)

          setRole(role)
        }}/> */}
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

export default FormEditOwner
