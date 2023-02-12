import { css } from "@emotion/css";
import { AddCircleFilled } from "@navikt/ds-icons";
import { SuccessFilled } from "@navikt/ds-icons";
import { ErrorFilled } from "@navikt/ds-icons";
import { Button, Heading, Label, Modal, TextField } from "@navikt/ds-react";
import Divider from "@navikt/ds-react-internal/esm/dropdown/Menu/Divider";
import { useEffect, useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { MultiValue, StylesConfig } from "react-select";
import Select from "react-select";

import { getResourceById, useResourceSearch } from "../../api";
import type {
  MemberFormValues,
  OptionType,
  ProductTeamFormValues,
  ProductTeamSubmitValues,
  Resource,
} from "../../constants";
import { AddressType, TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import EditResourceList from "./EditResourceList";

type ModalTeamProperties = {
  onClose: () => void;
  title: string;
  initialValues: ProductTeamFormValues;
  isOpen: boolean;
  onSubmitForm: (values: ProductTeamSubmitValues) => void;
};

const styles = {
  modalStyles: css`
    width: 850px;
    min-height: 400px;
    padding: 1rem;
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
    color: "var(--navds-global-color-gray-900)",
    padding: 10,
    backgroundColor: state.isSelected ? "var(--navds-global-color-gray-100)" : "#FFFFFF",
  }),
  input: (provided, state) => ({
    ...provided,
    height: "40px",
    width: "40px",
  }),
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused
      ? "1px solid var(--navds-text-field-color-border)"
      : "1px solid var(--navds-text-field-color-border)",
    boxShadow: state.isFocused ? "var(--navds-shadow-focus)" : undefined,
    marginTop: "0.5rem",
  }),
  menu: (provided, state) => ({
    ...provided,
  }),
};

const getRolesFromDropdown = (roles: MultiValue<any>) => {
  const roleArray: TeamRole[] = [];
  if (roles.length > 0) {
    for (const role of roles) {
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

  // States for å legge inn nye medlemmer
  const [newMemberIdent, setNewMemberIdent] = useState<string>();
  const [newMemberInfo, setNewMemberInfo] = useState<Resource>();
  const [newMemberRoles, setNewMemberRoles] = useState<TeamRole[]>();
  const [newMemberDescription, setNewMemberDescription] = useState<string>();

  const [editedMemberList, setEditedMemberList] = useState<MemberFormValues[]>(initialValues.members);
  const [forceReRender, setForceReRender] = useState<boolean>(false);

  const [newMemberSelected, setNewMemberSelected] = useState<boolean>();
  const [newMemberRolesSelected, setNewMemberRolesSelected] = useState<boolean>();
  const [newMemberAlreadyInTeam, setNewMemberAlreadyInTeam] = useState<boolean>();

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

  const {
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProductTeamFormValues>({
    defaultValues: {
      ...initialValues,
    },
  });

  const mapDataToSubmit = (data: ProductTeamFormValues) => {
    const clusterIds = data.clusterIds.map((c) => c.value);
    const tagsMapped = data.tags.map((t) => t.value);
    const memberData = editedMemberList;

    const teamHasLocation = !!data.officeHours;

    const days = data.officeHours?.days;

    const contactPersonIdentValue = data.contactPersonIdent ? data.contactPersonIdent.value : undefined;
    const teamOwnerIdentValue = data.teamOwnerIdent ? data.teamOwnerIdent?.value : undefined;

    const contactEmail = data.contactAddressEmail
      ? [{ address: data.contactAddressEmail, type: AddressType.EPOST }]
      : [];

    const contactSlackChannels = data.contactAddressesChannels
      ? data.contactAddressesChannels.map((c: OptionType) => ({
          address: c.value,
          type: AddressType.SLACK,
          slackChannel: { id: c.value, name: c.label },
        }))
      : [];

    const contactSlackUsers = data.contactAddressesUsers
      ? data.contactAddressesUsers.map((c: OptionType) => ({
          address: c.value,
          type: AddressType.SLACK_USER,
          slackChannel: { id: c.value, name: c.label },
          email: c.email,
        }))
      : [];

    const selectedLocationSection = teamHasLocation
      ? {
          locationCode: data.officeHours?.locationFloor?.value,
          days: days,
          information: data.officeHours?.information,
        }
      : undefined;
    console.log("handleSubmit kjøres - mapDataToSubmit");
    return {
      ...data,
      clusterIds: clusterIds,
      tags: tagsMapped,
      contactPersonIdent: contactPersonIdentValue,
      teamOwnerIdent: teamOwnerIdentValue,
      officeHours: selectedLocationSection,
      members: memberData,
      contactAddresses: [...contactSlackChannels, ...contactSlackUsers, ...contactEmail],
    };
  };

  const clearStates = () => {
    setNewMemberRoles(undefined);
    setNewMemberIdent(undefined);
    setNewMemberDescription(undefined);
    setNewMemberInfo(undefined);
    setNewMemberDescription(undefined);
    setNewMemberAlreadyInTeam(undefined);
  };

  useEffect(() => {
    (async () => {
      if (newMemberIdent) {
        const newMember = await getResourceById(newMemberIdent);
        console.log({ newMember });
        setNewMemberInfo(newMember);
      }
      checkFields({
        ident: newMemberIdent,
        roles: newMemberRoles,
        memberList: editedMemberList,
      });
    })();
  }, [isOpen, initialValues, newMemberIdent, newMemberRoles, editedMemberList, newMemberDescription, forceReRender]);

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
    console.log({ properties });
    for (const [index, member] of editedMemberList.entries()) {
      if (member.navIdent === ident) {
        console.log("membe", member);
        console.log("memberInArray", editedMemberList[index]);
        editedMemberList[index].roles = roles;
        if (description) {
          editedMemberList[index].description = description;
        }
        break;
      }
    }
  };

  return (
    <form>
      <Modal
        aria-label="Modal team edit"
        aria-labelledby="modal-heading"
        className={styles.modalStyles}
        onClose={() => {
          onClose();
          setEditedMemberList(initialValues.members);
        }}
        open={isOpen}
        shouldCloseOnOverlayClick={false}
      >
        <Modal.Content>
          <Heading level="1" size="large" spacing>
            {title}
          </Heading>
          <div
            className={css`
              margin-bottom: 3em;
            `}
          >
            <EditResourceList memberList={editedMemberList} onEditMember={editMembers} onRemoveMember={removeMember} />
          </div>
          {!addNewMember ? (
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
          ) : (
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
                <Label size="medium">Kontaktperson</Label>
                <Select
                  isClearable
                  isLoading={loadingPerson}
                  onChange={(resource) => setNewMemberIdent(resource.value)}
                  onInputChange={(event) => setResourceSearchPerson(event)}
                  options={!loadingPerson ? searchResultPerson : []}
                  placeholder="Søk og legg til person"
                  required
                  styles={customStyles}
                />
                {newMemberSelected == false && (
                  <p
                    className={css`
                      color: red;
                    `}
                  >
                    Ingen person er valgt
                  </p>
                )}

                {newMemberAlreadyInTeam == true && (
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
                  options={roleOptions}
                  placeholder="Legg til roller"
                  required
                  styles={customStyles}
                />
                {newMemberRolesSelected == false && (
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
                  id={"descriptionFieldNewMember"}
                  label={"Annet"}
                  onChange={(event) => setNewMemberDescription(event.target.value)}
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
                      }
                      console.log("knapp trykket");
                    }}
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
                    console.log(editedMemberList);
                  }}
                  variant={"secondary"}
                >
                  Angre
                </Button>
              </div>
            </div>
          )}
          <div className={css``}>
            <Divider />
            <Button
              className={css`
                width: 7em;
                margin-right: 2em;
              `}
              onClick={handleSubmit((data) => {
                onSubmitForm(mapDataToSubmit(data));
                clearStates();
                setEditedMemberList(initialValues.members);
                onClose();
              })}
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
                setEditedMemberList(initialValues.members);
                onClose();
              }}
              variant={"secondary"}
            >
              Avbryt
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </form>
  );
};

export default ModalMembers;
