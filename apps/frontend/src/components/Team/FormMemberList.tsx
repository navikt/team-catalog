import { Member, ProductTeamFormValues } from "../../constants";
import { ListItem, ListItemLabel } from "baseui/list";
import Button from "../common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { useState } from "react";
import { StatefulTooltip } from 'baseui/tooltip'
import { getResourceTypeText } from './ListMembers/CardMember'
import { Error } from '../common/ModalSchema'
import FormEditMember from './FormEditMember'
import { Block } from 'baseui/block'
import { FieldArrayRenderProps, FormikProps } from 'formik'
import { Option } from 'baseui/select'

type MemberListProps = {
  arrayHelpers: FieldArrayRenderProps,
  formikBag: FormikProps<ProductTeamFormValues>,
  emptyTeamLeader: () => void
}

const FormMembersList = (props: MemberListProps) => {
  const {arrayHelpers, formikBag, emptyTeamLeader} = props
  const [editIndex, setEditIndex] = useState<number>(-1)
  // We edit member in the list in FormEditMember. However if member is empty we need remove it, as validation will fail.
  // editIndex keeps track of if we're currently editing a member in the list or if it's just an empty search field
  const onChangeMember = (member?: Partial<Member>) => {
    if (editIndex >= 0) {
      if (!member) {
        removeMember(editIndex)
      } else {
        arrayHelpers.replace(editIndex, member)
      }
    } else {
      if (member) {
        const size = formikBag.values.members.length
        arrayHelpers.push(member)
        setEditIndex(size)
      }
    }
  }

  const removeMember = (index: number) => {
    arrayHelpers.remove(index)
    setEditIndex(-1)
    if (formikBag.values.teamLeader === arrayHelpers.form.values.members[index].navIdent) {
      formikBag.setFieldValue('teamLeader', '');
      emptyTeamLeader();
    }
  }

  const members = formikBag.values.members

  const filterMemberSearch = (options: Option[]) => {
    return options.filter(option => !members.map(m => m.navIdent).includes(option.id ? option.id.toString() : ""))
  }

  return (
    <Block width='100%'>

      <ul style={{paddingInlineStart: 0}}>
        {members.map((m: Member, index: number) => {
          return <MemberItem key={index}
                      index={index}
                      member={m}
                      editRow={index === editIndex}
                      onChangeMember={onChangeMember}
                      editMember={() => setEditIndex(index)}
                      removeMember={() => removeMember(index)}
                      filterMemberSearch={filterMemberSearch}
          />
        })}
      </ul>

      {editIndex < 0 && <FormEditMember onChangeMember={onChangeMember} filterMemberSearch={filterMemberSearch}/>}
      <Button tooltip="Legg til medlem"
              kind="minimal" type="button"
              icon={faPlus}
              onClick={() => {
                if (!formikBag.errors.members) {
                  setEditIndex(-1)
                }
              }}>
        Legg til medlem
      </Button>
    </Block>
  )
}

type MemberItemProps = {
  index: number,
  member: Member,
  editRow: boolean,
  onChangeMember: (member?: Partial<Member>) => void,
  editMember: () => void,
  removeMember: () => void
  filterMemberSearch: (o: Option[]) => Option[]
}

const MemberItem = (props: MemberItemProps) => {
  const {index, editRow, member} = props
  return <ListItem
    sublist
    endEnhancer={() => <Buttons hide={editRow} editMember={props.editMember} removeMember={props.removeMember}/>}
  >
    <Block width='100%'>
      <Block width='100%'>

        {editRow && <FormEditMember
          onChangeMember={props.onChangeMember}
          member={member}
          filterMemberSearch={props.filterMemberSearch}
        />}

        {!editRow &&
        <ListItemLabel>
          <StatefulTooltip content={member.navIdent}>
            <span><b>{member.name}</b> ({getResourceTypeText(member.resourceType)}) - {member.role}</span>
          </StatefulTooltip>
        </ListItemLabel>

        }
      </Block>
      <Block width='100%'>
        <Error fieldName={`members[${index}].navIdent`} fullWidth={true}/>
        <Error fieldName={`members[${index}].role`} fullWidth={true}/>
      </Block>
    </Block>
  </ListItem>
}

const Buttons = (props: { hide: boolean, editMember: () => void, removeMember: () => void }) => {
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


export default FormMembersList;
