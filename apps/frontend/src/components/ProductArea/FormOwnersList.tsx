import {ProductAreaOwnerFormValues, TeamRole} from "../../constants";
import {ListItem, ListItemLabel} from "baseui/list";
import Button from "../common/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faPlus, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import {useEffect, useState} from "react";
import {StatefulTooltip} from 'baseui/tooltip'
import {Error} from '../common/ModalSchema'
import {Block} from 'baseui/block'
import {FieldArrayRenderProps, FormikProps} from 'formik'
import {getResourcesForNaisteam, ResourceOption} from '../../api'
import {intl} from '../../util/intl/intl'
import {ObjectType} from '../admin/audit/AuditTypes'
import FormEditOwner from "./FormEditOwner";

export type MemberType = ObjectType.Team | ObjectType.ProductArea | ObjectType.Cluster

type OwnerListProps = {
  arrayHelpers: FieldArrayRenderProps,
  formikBag: FormikProps<{owners: ProductAreaOwnerFormValues[]}>,
  naisTeams?: string[],
  type: MemberType
}

type NavIdentType = {
  navIdent: string
}

const FormOwnersList = (props: OwnerListProps) => {
  const {arrayHelpers, formikBag, naisTeams = []} = props
  const [editIndex, setEditIndex] = useState<number>(-1)
  // We edit member in the list in FormEditMember. However if member is empty we need remove it, as validation will fail.
  // editIndex keeps track of if we're currently editing a member in the list or if it's just an empty search field
  const onChangeOwner = (owner?: ProductAreaOwnerFormValues) => {
    if (editIndex >= 0) {
      if (!owner) {
        removeOwner(editIndex)
      } else {
        arrayHelpers.replace(editIndex, owner)
      }
    } else {
      if (owner) {
        const size = formikBag.values.owners.length
        arrayHelpers.push(owner)
        setEditIndex(size)
      }
    }
  }

  // console.log({propsFormMemberList: props});


  const removeOwner = (index: number) => {
    arrayHelpers.remove(index)
    setEditIndex(-1)
  }

  const owners = formikBag.values.owners;

  // console.log({members, formikBag});
  

  const filterMemberSearch = <T extends NavIdentType>(options: T[]) => {
    return options.filter(option => !owners.map(o => o.navIdent).includes(option.navIdent ? option.navIdent.toString() : ""))
  }


  return (
    <Block width='100%'>

      <ul style={{paddingInlineStart: 0}}>
        {owners.map((o: ProductAreaOwnerFormValues, index: number) => {
          return <OwnerItem
            key={index}
            index={index}
            owner={o}
            editRow={index === editIndex}
            onChangeOwner={onChangeOwner}
            editOwner={() => setEditIndex(index)}
            removeOwner={() => removeOwner(index)}
            filterOwnerSearch={filterMemberSearch}
          />
        })}
        {editIndex < 0 && <ListItem overrides={{Content: {style: {height: 'auto'}}}}>
          <Block width={"100%"}><FormEditOwner onChangeOwner={onChangeOwner} filterMemberSearch={filterMemberSearch}/></Block>
        </ListItem>}
      </ul>

      <Block display='flex' justifyContent='space-between'>
        {/* <Block>
          <Button kind='minimal' type='button' icon={faSearch} onClick={() => setNaisMembers(!naisMembers)}>
            Foreslå nais medlemmer
          </Button>
        </Block> */}
        <Block>
          <Button tooltip="Legg til eier"
                  kind="minimal" type="button"
                  icon={faPlus}
                  onClick={() => {
                    console.log({leggtilEier: formikBag});
                    
                    if (editIndex >= 0) {
                      formikBag.setFieldTouched(`owners[${editIndex}].navIdent`)
                      formikBag.setFieldTouched(`owners[${editIndex}].roles`)
                    }
                    if (!formikBag.errors.owners) {
                      setEditIndex(-1)
                    }
                  }}>
            Legg til medlem
          </Button>
        </Block>
      </Block>
    </Block>
  )
}

type OwnerItemProps = {
  index: number,
  owner: ProductAreaOwnerFormValues,
  editRow: boolean,
  onChangeOwner: (owner?: ProductAreaOwnerFormValues) => void,
  editOwner: () => void,
  removeOwner: () => void
  filterOwnerSearch: (o: ResourceOption[]) => ResourceOption[]
}

const OwnerItem = (props: OwnerItemProps) => {
  const {index, editRow, owner} = props
  return <ListItem
    overrides={{Content: {style: {height: 'auto'}}}}
  >
    <Block width='100%'>
      <Block width='100%' display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
        <Block width={"100%"}>
          {editRow && <FormEditOwner
            onChangeOwner={props.onChangeOwner}
            owner={owner}
            filterMemberSearch={props.filterOwnerSearch}
          />}
          {!editRow && <OwnerView owner={owner}/>}
        </Block>
        <Block display={"flex"}>
          <Buttons hide={editRow} editMember={props.editOwner} removeMember={props.removeOwner}/>
        </Block>
      </Block>
      <Block width='100%'>
        <Error fieldName={`owners[${index}].navIdent`} fullWidth={true}/>
        <Error fieldName={`owners[${index}].roles`} fullWidth={true}/>
      </Block>
    </Block>
  </ListItem>
}

const Buttons = (props: {hide: boolean, editMember: () => void, removeMember: () => void}) => {
  return props.hide ? null :
    <>
      <Button type='button' kind='minimal' onClick={props.editMember}>
        <FontAwesomeIcon icon={faEdit}/>
      </Button>
      <Button type='button' kind='minimal' onClick={props.removeMember}>
        <FontAwesomeIcon icon={faTrash}/>
      </Button>
    </>
}

const OwnerView = (props: {owner: ProductAreaOwnerFormValues}) => {
  const {owner} = props
  const roles = 'roles' in props.owner ? '- ' + intl[owner.role] : ''
  return (
    <ListItemLabel>
      <StatefulTooltip content={owner.navIdent} focusLock={false}>
        {owner.fullName && <span><b>{owner.fullName}</b> ({intl[owner.resourceType!]}) {roles}</span>}
        {!owner.fullName && <span><b>{owner.navIdent}</b> (Ikke funnet i NOM) {roles}</span>}
      </StatefulTooltip>
    </ListItemLabel>
  )
}


export default FormOwnersList;
