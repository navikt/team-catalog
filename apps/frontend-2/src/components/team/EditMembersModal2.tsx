import { css } from "@emotion/css";
import { yupResolver } from "@hookform/resolvers/yup";
import { PencilFillIcon, PlusCircleFillIcon, TrashFillIcon } from "@navikt/aksel-icons";
import { Button, Heading, Label, Modal, TextField } from "@navikt/ds-react";
import * as React from "react";
import { useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import type { UseMutationResult } from "react-query";
import * as yup from "yup";

import { searchResource } from "../../api/resourceApi";
import type { Member, MemberFormValues } from "../../constants";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import { ModalActions } from "../ModalActions";
import { AsyncSearch, BasicSelect, SelectLayoutWrapper } from "../select/CustomSelectComponents";

export function EditMembersModal2({
  members,
  open,
  onClose,
  updateMemberOfTeamMutation,
}: {
  members: Member[];
  open: boolean;
  onClose: () => void;
  updateMemberOfTeamMutation: UseMutationResult<unknown, unknown, MemberFormValues[]>;
}) {
  return (
    <Modal onClose={onClose} open={open} shouldCloseOnOverlayClick={false}>
      <Modal.Content
        className={css`
          width: 700px;

          @media screen and (max-width: 700px) {
            width: 100%;
          }
        `}
      >
        <Heading level="1" size="large" spacing>
          Endre medlemmer
        </Heading>
        <div
          className={css`
            display: flex;
            flex-direction: column;
            gap: 1rem;
          `}
        >
          <NewMember members={members} updateMemberOfTeamMutation={updateMemberOfTeamMutation} />
          {members.map((member) => (
            <EditMember
              key={member.navIdent}
              member={member}
              members={members}
              updateMemberOfTeamMutation={updateMemberOfTeamMutation}
            />
          ))}
        </div>
      </Modal.Content>
    </Modal>
  );
}

function NewMember({
  updateMemberOfTeamMutation,
  members,
}: {
  members: Member[];
  updateMemberOfTeamMutation: UseMutationResult<unknown, unknown, MemberFormValues[]>;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        className={css`
          width: max-content;
        `}
        icon={<PlusCircleFillIcon />}
        onClick={() => setOpen(true)}
        variant="secondary"
      >
        Legg til nytt medlem
      </Button>
    );
  }

  return (
    <MemberForm
      members={members}
      onClose={() => setOpen(false)}
      updateMemberOfTeamMutation={updateMemberOfTeamMutation}
    />
  );
}

function EditMember({
  member,
  members,
  updateMemberOfTeamMutation,
}: {
  member: Member;
  members: Member[];
  updateMemberOfTeamMutation: UseMutationResult<unknown, unknown, MemberFormValues[]>;
}) {
  const [open, setOpen] = useState(false);
  const { resource, roles } = member;

  console.log(updateMemberOfTeamMutation);

  const removeMember = () => {
    const unchangedMembers = members.filter(({ navIdent }) => navIdent !== member.navIdent);
    updateMemberOfTeamMutation.mutate(unchangedMembers);
  };

  if (!resource) {
    return <></>;
  }

  const resourceText = resource.resourceType && intl[resource.resourceType];
  const memberRoles = roles.map((role) => intl[role]).join(", ");

  if (!open) {
    return (
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: var(--a-deepblue-50);
          gap: 1rem;
          align-items: center;

          > span {
            flex: 1;
          }
        `}
      >
        <span>
          <Label as="span">
            {resource.fullName} {resourceText ? `(${resourceText})` : ""}
          </Label>
          {` - ${memberRoles}`}
        </span>
        <Button icon={<PencilFillIcon aria-hidden />} onClick={() => setOpen(true)} size="small" variant="secondary" />
        <Button
          icon={<TrashFillIcon aria-hidden />}
          loading={
            updateMemberOfTeamMutation.isLoading &&
            updateMemberOfTeamMutation.variables?.every(({ navIdent }) => navIdent !== member.navIdent)
          }
          onClick={removeMember}
          size="small"
          variant="secondary"
        />
      </div>
    );
  }

  return (
    <MemberForm
      member={member}
      members={members}
      onClose={() => setOpen(false)}
      updateMemberOfTeamMutation={updateMemberOfTeamMutation}
    />
  );
}

function MemberForm({
  member,
  members,
  onClose,
  updateMemberOfTeamMutation,
}: {
  member?: Member;
  members: Member[];
  onClose: () => void;
  updateMemberOfTeamMutation: UseMutationResult<unknown, unknown, MemberFormValues[]>;
}) {
  const { resource, roles, description, navIdent } = member ?? {};
  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      navIdent,
      description: description,
      roles: roles ?? [],
    },
  });

  const roleOptions = Object.values(TeamRole).map((role) => ({
    value: role,
    label: intl[role],
  }));

  const onSubmitUpdatedMember = methods.handleSubmit((submittedValues) => {
    const updatedMember = member
      ? {
          ...member,
          roles: submittedValues.roles,
          description: submittedValues.description,
        }
      : {
          ...submittedValues,
        };

    const unchangedMembers = members.filter(({ navIdent }) => navIdent !== updatedMember.navIdent);

    updateMemberOfTeamMutation.mutate([...unchangedMembers, updatedMember], { onSuccess: onClose });
  });

  return (
    <FormProvider {...methods}>
      <form
        className={css`
          padding: 1rem;
          background: var(--a-gray-100);
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          gap: 1rem;
        `}
        onSubmit={onSubmitUpdatedMember}
      >
        {member ? <TextField label="Navn" readOnly value={resource?.fullName} /> : <SearchForPersonFormPart />}
        <Controller
          control={methods.control}
          name="roles"
          render={({ field }) => (
            <SelectLayoutWrapper htmlFor="roles" label="Roller">
              <BasicSelect
                inputId="roles"
                isClearable
                isMulti
                onChange={(options) => field.onChange(options.map((option) => option.value))}
                options={roleOptions}
                placeholder="Legg til roller"
                value={roleOptions.filter((option) => field.value.includes(option.value))}
              />
            </SelectLayoutWrapper>
          )}
        />
        <TextField {...methods.register("description")} defaultValue={description} label="Annet" />
        <ModalActions
          isLoading={
            updateMemberOfTeamMutation.isLoading &&
            !!updateMemberOfTeamMutation.variables?.some(({ navIdent }) => navIdent === methods.watch("navIdent"))
          }
          onClose={() => {
            methods.reset();
            onClose();
          }}
        />
      </form>
    </FormProvider>
  );
}

const RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT = 3;
function SearchForPersonFormPart() {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name="navIdent"
      render={({ field }) => (
        <SelectLayoutWrapper htmlFor="navIdent" label="Navn">
          <AsyncSearch
            inputId="navIdent"
            loadOptions={searchFoResource}
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT
                ? "Skriv minst 3 bokstaver i søkefeltet"
                : `Fant ingen resultater for "${inputValue}"`
            }
            onChange={(option) => field.onChange(option?.value)}
            placeholder="Søk etter ansatt"
          />
        </SelectLayoutWrapper>
      )}
    />
  );
}

async function searchFoResource(searchTerm: string) {
  if (searchTerm.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT) {
    return [];
  }

  const response = await searchResource(searchTerm);

  return response.content.map((resource) => ({
    value: resource.navIdent,
    label: resource.fullName,
  }));
}

const validationSchema = yup.object({
  navIdent: yup.string().required("Påkrevd"),
  roles: yup.array(yup.mixed<TeamRole>().required()).ensure().required(),
  description: yup.string().ensure().optional(),
});

type FormValues = yup.InferType<typeof validationSchema>;
