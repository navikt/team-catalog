import { css } from "@emotion/css";
import { AddCircleFilled } from "@navikt/ds-icons";
import { SuccessFilled } from "@navikt/ds-icons";
import { ErrorFilled } from "@navikt/ds-icons";
import { Button, Heading, Label, Modal, TextField } from "@navikt/ds-react";
import Divider from "@navikt/ds-react-internal/esm/dropdown/Menu/Divider";
import { useEffect, useState } from "react";
import * as React from "react";
import type { MultiValue, StylesConfig } from "react-select";
import Select from "react-select";

import { getResourceById, useResourceSearch } from "../../api";
import type { MemberFormValues, OptionType, Resource } from "../../constants";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import EditResourceList from "./EditResourceList";

type ModalTeamProperties = {
  onClose: () => void;
  title: string;
  initialValues: MemberFormValues[];
  isOpen: boolean;
  onSubmitForm: (values: MemberFormValues[]) => void;
};

const styles = {
  modalStyles: css`
    width: 850px;
    min-height: 400px;
    padding: 1rem 1rem 0;
  `,
  boxStyles: css`
    background: #e6f1f8;
    border: 1px solid #236b7d;
    border-radius: 5px;
    min-height: 40px;
    margin-top: 1rem;
    padding: 2rem;
    width: 100%;
  `,
  row: css`
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1rem;
  `,
  buttonSection: css`
    border-top: 1px solid #cfcfcf;
    margin-top: 2rem;
    width: 100%;
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    position: sticky;
  `,
};

export const customStyles: StylesConfig<any> = {
  option: (provided, state) => ({
    ...provided,
    borderBottom: "1px dotted pink",
    color: "var(--a-gray-900)",
    padding: 10,
    backgroundColor: state.isSelected ? "var(--a-gray-100)" : "#FFFFFF",
  }),
  input: (provided) => ({
    ...provided,
    height: "40px",
    width: "40px",
  }),
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? "1px solid var(--a-border-default)" : "1px solid var(--a-border-default)",
    boxShadow: state.isFocused ? "var(--a-shadow-focus)" : undefined,
    marginTop: "0.5rem",
  }),
  menu: (provided) => ({
    ...provided,
  }),
};

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

const ModalMembers = (properties: ModalTeamProperties) => {
  const { onClose, title, initialValues, isOpen, onSubmitForm } = properties;

  const [searchResultPerson, setResourceSearchPerson, loadingPerson] = useResourceSearch();
  const [addNewMember, setAddNewMember] = useState<boolean>(false);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  // States for å legge inn nye medlemmer
  const [newMemberIdent, setNewMemberIdent] = useState<string>();
  const [newMemberInfo, setNewMemberInfo] = useState<Resource>();
  const [newMemberRoles, setNewMemberRoles] = useState<TeamRole[]>();
  const [newMemberDescription, setNewMemberDescription] = useState<string>();

  const [editedMemberList, setEditedMemberList] = useState<MemberFormValues[]>([...initialValues]);
  const [forceReRender, setForceReRender] = useState<boolean>(false);

  const [newMemberSelected, setNewMemberSelected] = useState<boolean>();
  const [newMemberRolesSelected, setNewMemberRolesSelected] = useState<boolean>();
  const [newMemberAlreadyInTeam, setNewMemberAlreadyInTeam] = useState<boolean>();

  const [showErrorNoMemberSelected, setShowErrorNoMemberSelected] = useState<boolean>(false);
  const [showErrorAlreadyMember, setShowErrorAlreadyMember] = useState<boolean>(false);
  const [showErrorRolesNotSelected, setShowErrorRolesNotSelected] = useState<boolean>(false);

  const [memberSelectField, setMemberSelectField] = useState<OptionType>();
  const checkFields = (properties: {
    ident: string | undefined;
    roles: TeamRole[] | undefined;
    memberList: MemberFormValues[];
  }) => {
    const { ident, roles, memberList } = properties;

    const allMemberIdents = memberList.map((member) => member.navIdent);

    if (ident) {
      setNewMemberSelected(true);
      if (allMemberIdents.includes(ident)) {
        setNewMemberAlreadyInTeam(true);
      } else {
        setNewMemberAlreadyInTeam(false);
      }
    } else {
      setNewMemberSelected(false);
    }

    if (roles) {
      setNewMemberRolesSelected(true);
    } else {
      setNewMemberRolesSelected(false);
    }
  };

  const addNewMemberTemporary = (properties: {
    resource: Resource;
    ident: string;
    roles: TeamRole[];
    description?: string;
    temporaryMemberList: MemberFormValues[];
  }) => {
    const { resource, ident, roles, description, temporaryMemberList } = properties;

    const newMemberFormValue: MemberFormValues = {
      fullName: resource.fullName,
      navIdent: ident,
      resourceType: resource.resourceType,
      roles: roles,
    };

    if (description) {
      newMemberFormValue.description = description;
    }

    temporaryMemberList.unshift(newMemberFormValue);
  };

  const roleOptions = Object.values(TeamRole).map((tr) => ({
    value: Object.keys(TeamRole)[Object.values(TeamRole).indexOf(tr as TeamRole)],
    label: intl[tr],
  }));

  const clearStates = () => {
    setNewMemberRoles(undefined);
    setNewMemberIdent(undefined);
    setNewMemberDescription(undefined);
    setNewMemberInfo(undefined);
    setNewMemberDescription(undefined);
    setNewMemberAlreadyInTeam(undefined);
    setUnsavedChanges(false);
    setAddNewMember(false);
    setShowErrorAlreadyMember(false);
    setShowErrorRolesNotSelected(false);
    setShowErrorNoMemberSelected(false);
  };

  useEffect(() => {
    (async () => {
      if (initialValues) {
        setEditedMemberList(initialValues);
      }
      if (newMemberIdent) {
        const newMember = await getResourceById(newMemberIdent);
        setNewMemberInfo(newMember);
      }
      checkFields({
        ident: newMemberIdent,
        roles: newMemberRoles,
        memberList: editedMemberList,
      });
    })();
  }, [isOpen, newMemberIdent, newMemberRoles, editedMemberList, newMemberDescription, forceReRender]);

  const removeMember = (properties: { memberIdent: string }) => {
    const { memberIdent } = properties;
    for (const [index, member] of editedMemberList.entries()) {
      if (member.navIdent === memberIdent) {
        editedMemberList.splice(index, 1);
        // fiks for å vise listen i modalen skikkelig
        setForceReRender(!forceReRender);
      }
    }
  };

  const editMembers = (properties: { ident: string; roles: TeamRole[]; description?: string }) => {
    const { ident, roles, description } = properties;
    //For skjermlesere
    Modal.setAppElement("body");
    for (const [index, member] of editedMemberList.entries()) {
      if (member.navIdent === ident) {
        editedMemberList[index].roles = roles;
        editedMemberList[index].description = description;
        break;
      }
    }
  };

  return (
    <Modal
      aria-label="Modal team edit"
      aria-labelledby="modal-heading"
      className={styles.modalStyles}
      onClose={() => {
        onClose();
        setAddNewMember(false);
        clearStates();
        setEditedMemberList(initialValues);
      }}
      open={isOpen}
      shouldCloseOnOverlayClick={false}
    >
      <Modal.Content>
        <Heading level="1" size="large" spacing>
          {title}
        </Heading>

        {addNewMember ? (
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
                isClearable
                isLoading={loadingPerson}
                onChange={(event) => {
                  if (event) {
                    setNewMemberIdent(event.value);
                  } else {
                    setNewMemberInfo(undefined);
                    setMemberSelectField(undefined);
                    setShowErrorAlreadyMember(false);
                  }
                }}
                onInputChange={(event) => {
                  setResourceSearchPerson(event);
                  setShowErrorAlreadyMember(false);
                  setShowErrorNoMemberSelected(false);
                }}
                options={loadingPerson ? [] : searchResultPerson}
                placeholder="Søk og legg til person"
                required
                styles={customStyles}
                value={memberSelectField}
              />
              {showErrorNoMemberSelected && (
                <p
                  className={css`
                    color: red;
                  `}
                >
                  Ingen person er valgt
                </p>
              )}

              {showErrorAlreadyMember && (
                <p
                  className={css`
                    color: red;
                  `}
                >
                  Personen er allerede medlem
                </p>
              )}
            </div>
            <div
              className={css`
                width: 48%;
              `}
            >
              <Label size="medium">Roller</Label>
              <Select
                isClearable
                isMulti
                onChange={(roles) => setNewMemberRoles(getRolesFromDropdown(roles))}
                onInputChange={() => setShowErrorRolesNotSelected(false)}
                options={roleOptions}
                placeholder="Legg til roller"
                required
                styles={customStyles}
              />
              {showErrorRolesNotSelected && (
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
                label={"Annet"}
                onChange={(event) => {
                  setNewMemberDescription(event.target.value);
                }}
                type={"text"}
              />
            </div>

            <div
              className={css`
                margin-top: 1.5em;
              `}
            >
              {newMemberInfo ? (
                <Button
                  className={css`
                    margin-right: 2em;
                  `}
                  icon={<SuccessFilled aria-hidden />}
                  onClick={() => {
                    if (
                      newMemberSelected &&
                      newMemberInfo &&
                      newMemberIdent &&
                      newMemberRoles &&
                      newMemberRolesSelected &&
                      !newMemberAlreadyInTeam
                    ) {
                      addNewMemberTemporary({
                        resource: newMemberInfo,
                        ident: newMemberIdent,
                        roles: newMemberRoles,
                        description: newMemberDescription,
                        temporaryMemberList: editedMemberList,
                      });
                      setAddNewMember(false);
                      clearStates();
                    } else {
                      if (newMemberAlreadyInTeam) {
                        setShowErrorAlreadyMember(true);
                      }
                      if (!newMemberRoles) {
                        setShowErrorRolesNotSelected(true);
                      }
                    }
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
                  setAddNewMember(false);
                  clearStates();
                }}
                size={"small"}
                variant={"secondary"}
              >
                Angre
              </Button>
            </div>
            <div
              className={css`
                width: 100%;
                color: #c92b17;
                font-weight: bold;
              `}
            >
              {unsavedChanges && <p>Du har uferdige endringer</p>}
            </div>
          </div>
        ) : (
          <Button
            className={css`
              margin-bottom: 1em;
            `}
            icon={<AddCircleFilled aria-hidden />}
            onClick={() => {
              setAddNewMember(!addNewMember);
            }}
            variant={"secondary"}
          >
            Legg til nytt medlem
          </Button>
        )}
        <div
          className={css`
            margin-bottom: 3em;
          `}
        >
          <EditResourceList memberList={editedMemberList} onEditMember={editMembers} onRemoveMember={removeMember} />
        </div>

        <div
          className={css`
            position: sticky;
            bottom: 0;
            background: white;
            padding-bottom: 2em;
          `}
        >
          <Divider className={css``} />
          <Button
            className={css`
              width: 7em;
              margin-right: 2em;
            `}
            onClick={() => {
              if (addNewMember) {
                setUnsavedChanges(true);
              } else {
                onSubmitForm(editedMemberList);
                clearStates();
                onClose();
              }
            }}
            type="submit"
          >
            Lagre
          </Button>
          <Button
            className={css`
              width: 7em;
            `}
            onClick={() => {
              clearStates();
              setEditedMemberList(initialValues);
              onClose();
            }}
            variant={"secondary"}
          >
            Avbryt
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default ModalMembers;
