import { Member } from "../../constants";
import { ListItem, ListItemLabel } from "baseui/list";
import Button from "../common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { StatefulTooltip } from 'baseui/tooltip'
import { getResourceTypeText } from './ListMembers/CardMember'

const AddedMembersList = (props: { members: Member[], onRemove: Function }) =>
  <ul style={{paddingInlineStart: 0}}>
    {props.members.map((m: Member, index: number) => (
      <ListItem
        key={index}
        sublist
        endEnhancer={() => (
          <Button type='button' kind='minimal' onClick={() => props.onRemove(index)}>
            <FontAwesomeIcon icon={faTrash}/>
          </Button>
        )}
      >
        <ListItemLabel>
          <StatefulTooltip content={m.navIdent}>
            <span><b>{m.name}</b> ({getResourceTypeText(m.resourceType)}) - {m.role}</span>
          </StatefulTooltip>
        </ListItemLabel>
      </ListItem>
    ))}
  </ul>

export default AddedMembersList;
