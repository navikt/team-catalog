import { Member, MemberFormValues, ProductTeamFormValues, TeamRole } from "../../constants";
import { ListItem, ListItemLabel } from "baseui/list";
import Button from "../common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { useEffect, useState } from "react";
import { StatefulTooltip } from 'baseui/tooltip'
import { Error } from '../common/ModalSchema'
import FormEditMember from './FormEditMember'
import { Block } from 'baseui/block'
import { FieldArrayRenderProps, FormikProps } from 'formik'
import { getResourcesForNaisteam, ResourceOption } from '../../api/resourceApi'
import { intl } from '../../util/intl/intl'

type MemberListProps = {
  arrayHelpers: FieldArrayRenderProps,
  formikBag: FormikProps<ProductTeamFormValues>,
  naisTeams: string[]
}

type NavIdentType = {
  navIdent: string
}

const FormMembersList = (props: MemberListProps) => {
  const {arrayHelpers, formikBag} = props
  const [naisMembers, setNaisMembers] = useState(false)
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
  }

  const members = formikBag.values.members

  const filterMemberSearch = <T extends NavIdentType>(options: T[]) => {
    return options.filter(option => !members.map(m => m.navIdent).includes(option.navIdent ? option.navIdent.toString() : ""))
  }

  const addMember = (member: Member) => {
    const numMembers = formikBag.values.members.length
    arrayHelpers.push({...member})
    setEditIndex(numMembers)
  }

  return (
    <Block width='100%'>

      <ul style={{paddingInlineStart: 0}}>
        {members.map((m: MemberFormValues, index: number) => {
          return <MemberItem
            key={index}
            index={index}
            member={m}
            editRow={index === editIndex}
            onChangeMember={onChangeMember}
            editMember={() => setEditIndex(index)}
            removeMember={() => removeMember(index)}
            filterMemberSearch={filterMemberSearch}
          />
        })}
        {editIndex < 0 && <ListItem overrides={{Content: {style: {height: 'auto'}}}}>
          <Block width={"100%"}><FormEditMember onChangeMember={onChangeMember} filterMemberSearch={filterMemberSearch}/></Block>
        </ListItem>}
      </ul>

      <Block display='flex' justifyContent='space-between'>
        <Block>
          <Button kind='minimal' type='button' icon={faSearch} onClick={() => setNaisMembers(!naisMembers)}>
            Foreslå nais medlemmer
          </Button>
        </Block>
        <Block>
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
      </Block>
      {naisMembers && <NaisMembers naisTeams={props.naisTeams} add={addMember} filterMemberSearch={filterMemberSearch}/>}
    </Block>
  )
}

type MemberItemProps = {
  index: number,
  member: MemberFormValues,
  editRow: boolean,
  onChangeMember: (member?: Partial<Member>) => void,
  editMember: () => void,
  removeMember: () => void
  filterMemberSearch: (o: ResourceOption[]) => ResourceOption[]
}

const MemberItem = (props: MemberItemProps) => {
  const {index, editRow, member} = props
  return <ListItem
    overrides={{Content: {style: {height: 'auto'}}}}
  >
    <Block width='100%'>
      <Block width='100%' display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
        <Block width={"100%"}>
          {editRow && <FormEditMember
            onChangeMember={props.onChangeMember}
            member={member}
            filterMemberSearch={props.filterMemberSearch}
          />}
          {!editRow && <MemberView member={member}/>}
        </Block>
        <Block display={"flex"}>
          <Buttons hide={editRow} editMember={props.editMember} removeMember={props.removeMember}/>
        </Block>
      </Block>
      <Block width='100%'>
        <Error fieldName={`members[${index}].navIdent`} fullWidth={true}/>
        <Error fieldName={`members[${index}].roles`} fullWidth={true}/>
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

const MemberView = (props: { member: MemberFormValues }) => {
  const {member} = props
  return (
    <ListItemLabel>
      <StatefulTooltip content={member.navIdent} focusLock={false}>
        {member.name && <span><b>{member.name}</b> ({intl[member.resourceType!]}) - {props.member.roles.map(r => intl[r]).join(", ")}</span>}
        {!member.name && <span><b>{member.navIdent}</b> (Ikke funnet i NOM) - {props.member.roles.map(r => intl[r]).join(", ")}</span>}
      </StatefulTooltip>
    </ListItemLabel>
  )
}

const NaisMembers = (props: { naisTeams: string[], add: (member: Member) => void, filterMemberSearch: (members: Member[]) => Member[] }) => {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    (async () => {
      const res = await Promise.all(props.naisTeams.map(getResourcesForNaisteam))
      let map = res.flatMap(r => r.content)
      .map(r => ({...r, name: r.fullName, roles: [TeamRole.DEVELOPER], description: ''}))
      setMembers(map)
    })()
  }, [props.naisTeams])

  return (
    <ul>
      {props.filterMemberSearch(members).map(member =>
        <ListItem key={member.navIdent} sublist
                  endEnhancer={() => <Button type='button' kind='minimal' onClick={() => props.add(member)}>
                    <FontAwesomeIcon icon={faPlus}/>
                  </Button>}
        >
          <MemberView member={member}/>
        </ListItem>)}
    </ul>
  )
}


export default FormMembersList;
