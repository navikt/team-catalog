import {Member} from "../../constants";
import {ListItem, ListItemLabel} from "baseui/list";
import Button from "../common/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import {StatefulTooltip} from 'baseui/tooltip'
import {getResourceTypeText} from './ListMembers/CardMember'
import {Error} from '../common/ModalSchema'
import FormEditMember from './FormEditMember'
import {Block} from 'baseui/block'

type memberListProps = {
  members: Member[],
  editIndex: number,
  onEdit: (idx: number) => void,
  onRemove: (idx: number) => void
  onChangeMember: (member?: Member) => void
}

const FormMembersList = (props: memberListProps) =>
  <ul style={{paddingInlineStart: 0}}>
    {props.members.map((m: Member, index: number) => {
      const editRow = index === props.editIndex
      return (
        <ListItem
          key={index}
          sublist
          endEnhancer={editRow ? undefined : () => (
            <>
              <Button type='button' kind='minimal' onClick={() => props.onEdit(index)}>
                <FontAwesomeIcon icon={faEdit}/>
              </Button>
              <Button type='button' kind='minimal' onClick={() => props.onRemove(index)}>
                <FontAwesomeIcon icon={faTrash}/>
              </Button>
            </>
          )}
        >
          <Block width='100%'>
            <Block width='100%'>

              {editRow && <FormEditMember
                onChangeMember={props.onChangeMember}
                editIndex={props.editIndex}
                member={m}
                members={props.members}
              />}

              {!editRow &&
              <ListItemLabel>
                <StatefulTooltip content={m.navIdent}>
                  <span><b>{m.name}</b> ({getResourceTypeText(m.resourceType)}) - {m.role}</span>
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
      )
    })}
    {props.editIndex < 0 && <FormEditMember onChangeMember={props.onChangeMember} editIndex={-1} members={props.members}/>}
  </ul>

export default FormMembersList;
