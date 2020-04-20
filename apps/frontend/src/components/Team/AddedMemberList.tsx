import { Member } from "../../constants";
import { ListItem, ListItemLabel } from "baseui/list";
import Button from "../common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import * as React from "react";

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
        <ListItemLabel><b>{m.name}</b> - {m.navIdent} - {m.role}</ListItemLabel>
      </ListItem>
    ))}
  </ul>

export default AddedMembersList;
