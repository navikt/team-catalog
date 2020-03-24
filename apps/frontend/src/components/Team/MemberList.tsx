import * as React from 'react';
import { ListItem, ListItemLabel } from 'baseui/list';
import { useStyletron } from 'baseui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Block } from 'baseui/block';
import { Member } from '../../constants';




const MemberList = (props: { list: Member[] }) => {
    const [css] = useStyletron();

    return (
        <ul>
            {props.list.map((member: Member) => (
                <ListItem>
                    <Block display="flex" alignItems="center" width="100%">
                        <FontAwesomeIcon icon={faUser} />
                        <Block display="flex" alignItems="baseline" justifyContent="space-between" marginLeft="2rem" width="100%">
                            <ListItemLabel>{member.name}</ListItemLabel>
                            <ListItemLabel sublist>{member.navIdent}</ListItemLabel>
                            <ListItemLabel sublist>{member.role}</ListItemLabel>
                        </Block>

                    </Block>

                </ListItem>
            ))}

        </ul>
    );
};

export default MemberList