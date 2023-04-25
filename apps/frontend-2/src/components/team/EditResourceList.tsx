import { css } from "@emotion/css";
import { EditFilled, ErrorFilled, SuccessFilled } from "@navikt/ds-icons";
import { DeleteFilled } from "@navikt/ds-icons";
import { Button, Label, TextField } from "@navikt/ds-react";
import { Fragment, useEffect, useState } from "react";
import * as React from "react";
import type { MultiValue } from "react-select";
import Select from "react-select";

import type { MemberFormValues } from "../../constants";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import { customStyles } from "./ModalMembers";

const getRolesFromDropdown = (roles: MultiValue<any>) => {
  const roleArray: TeamRole[] = [];
  if (roles.length > 0) {
    for (const role of roles) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      roleArray.push(TeamRole[role.value]);
    }
    return roleArray;
  } else {
    return undefined;
  }
};

const EditMember = (properties: {
  member: MemberFormValues;
  onRemoveMember: (properties: { memberIdent: string }) => void;
  onEditMember: (properties: { ident: string; roles: TeamRole[]; description?: string }) => void;
}) => {
  const [editingStatus, setEditingStatus] = useState<boolean>(false);
  const { member, onRemoveMember, onEditMember } = properties;

  const [editMemberRolesSelected, setEditMemberRolesSelected] = useState<boolean>();

  const [editMemberRoles, setEditMemberRoles] = useState<TeamRole[]>(member.roles);
  const [editMemberDescription, setEditMemberDescription] = useState<string | undefined>(member.description);

  const roles = member.roles.map((role) => intl[role]);

  const roleOptions = Object.values(TeamRole).map((tr) => ({
    value: Object.keys(TeamRole)[Object.values(TeamRole).indexOf(tr as TeamRole)],
    label: intl[tr],
  }));

  const memberRoleOption = member.roles.map((tr) => ({
    value: Object.keys(TeamRole)[Object.values(TeamRole).indexOf(tr as TeamRole)],
    label: intl[tr],
  }));

  const checkFields = (properties: { roles: TeamRole[] | undefined }) => {
    const { roles } = properties;

    if (roles) {
      setEditMemberRolesSelected(true);
    } else {
      setEditMemberRolesSelected(false);
    }
  };

  useEffect(() => {
    checkFields({ roles: editMemberRoles });
  }, [editMemberRoles]);

  return (
    <Fragment>
      {editingStatus ? (
        <div
          className={css`
            background-color: #f5f5f5;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            padding: 1em;
            margin-top: 1em;
            margin-bottom: 1em;
          `}
        >
          <div
            className={css`
              width: 48%;
            `}
          >
            <Label size="medium">Navn</Label>
            <Select
              defaultValue={{ value: member.navIdent, label: member.fullName }}
              isDisabled
              styles={customStyles}
            />
          </div>
          <div
            className={css`
              width: 48%;
            `}
          >
            <Label size="medium">Roller</Label>
            <Select
              defaultValue={memberRoleOption}
              isClearable
              isMulti
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={(roles) => setEditMemberRoles(getRolesFromDropdown(roles))}
              options={roleOptions}
              placeholder="Legg til roller"
              required
              styles={customStyles}
            />
            {editMemberRolesSelected == false && true && (
              <p
                className={css`
                  color: red;
                `}
              >
                Ingen roller er valgt
              </p>
            )}
          </div>
          <div
            className={css`
              width: 100%;
              margin-top: 1.5em;
            `}
          >
            <TextField
              defaultValue={member.description}
              id={"descriptionFieldNewMember"}
              label={"Annet"}
              onChange={(event) => {
                if (event.target.value === "") {
                  setEditMemberDescription(undefined);
                } else {
                  setEditMemberDescription(event.target.value);
                }
              }}
              type={"text"}
            />
          </div>

          <div
            className={css`
              margin-top: 1.5em;
            `}
          >
            {editMemberRolesSelected ? (
              <Button
                className={css`
                  margin-right: 2em;
                `}
                icon={<SuccessFilled aria-hidden />}
                onClick={() => {
                  if (editMemberRolesSelected) {
                    onEditMember({
                      ident: member.navIdent,
                      roles: editMemberRoles || [],
                      description: editMemberDescription,
                    });
                  }
                  setEditingStatus(false);
                }}
                size={"small"}
                variant={"secondary"}
              >
                Ferdig
              </Button>
            ) : (
              <Button
                className={css`
                  margin-right: 2em;
                `}
                disabled
                icon={<SuccessFilled aria-hidden />}
                size={"small"}
                variant={"secondary"}
              >
                Ferdig
              </Button>
            )}

            <Button
              icon={<ErrorFilled aria-hidden />}
              onClick={() => {
                setEditingStatus(false);
              }}
              size={"small"}
              variant={"secondary"}
            >
              Angre
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={css`
            width: 100%;
            display: flex;
            background-color: #e6f1f8;
            margin-bottom: 1em;
            padding-left: 1em;
            padding-right: 1em;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <div
            className={css`
              max-width: 90%;
            `}
          >
            <>
              {member && (
                <p>
                  <b>
                    {member.fullName} {member.resourceType ? `(${intl[member.resourceType]})` : `(${intl.OTHER})`}
                  </b>{" "}
                  - {roles.join(", ")}
                  {member.description && `, Annet: ${member.description}`}
                </p>
              )}
            </>
          </div>
          <div>
            <EditFilled
              className={css`
                margin-right: 1em;
                :hover {
                  cursor: pointer;
                }
              `}
              color={"#005077"}
              onClick={() => setEditingStatus(!editingStatus)}
            />
            <DeleteFilled
              className={css`
                :hover {
                  cursor: pointer;
                }
              `}
              color={"#005077"}
              onClick={() => onRemoveMember({ memberIdent: member.navIdent })}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export const EditResourceList = (properties: {
  memberList: MemberFormValues[];
  onRemoveMember: (properties: { memberIdent: string }) => void;
  onEditMember: (properties: { ident: string; roles: TeamRole[]; description?: string }) => void;
}) => {
  const { memberList, onRemoveMember, onEditMember } = properties;
  return (
    <div>
      {memberList.map((member) => (
        <EditMember key={member.navIdent} member={member} onEditMember={onEditMember} onRemoveMember={onRemoveMember} />
      ))}
    </div>
  );
};
