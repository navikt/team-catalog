import { css } from "@emotion/css";
import { yupResolver } from "@hookform/resolvers/yup";
import { PencilFillIcon } from "@navikt/aksel-icons";
import { Button, Heading, Label, Modal, TextField } from "@navikt/ds-react";
import * as React from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { UseMutationResult } from "react-query";
import * as yup from "yup";

import type { Member, ProductTeamResponse } from "../../constants";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import { ModalActions } from "../ModalActions";
import { BasicSelect, SelectLayoutWrapper } from "../select/CustomSelectComponents";

export function EditMembersModal2({
  members,
  open,
  onClose,
  updateMemberOfTeamMutation,
}: {
  members: Member[];
  open: boolean;
  onClose: () => void;
  updateMemberOfTeamMutation: UseMutationResult<ProductTeamResponse, unknown, Member>;
}) {
  return (
    <Modal onClose={onClose} open={open} shouldCloseOnOverlayClick={false}>
      <Modal.Content
        className={css`
          max-width: 700px;
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
          {members.map((member) => (
            <EditMember key={member.navIdent} member={member} updateMemberOfTeamMutation={updateMemberOfTeamMutation} />
          ))}
        </div>
      </Modal.Content>
    </Modal>
  );
}

function EditMember({
  member,
  updateMemberOfTeamMutation,
}: {
  member: Member;
  updateMemberOfTeamMutation: UseMutationResult<ProductTeamResponse, unknown, Member>;
}) {
  const [open, setOpen] = useState(false);
  const { resource, roles, description } = member;

  const methods = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: resource.fullName,
      description: description,
      roles: roles,
    },
  });

  console.log(methods.watch());

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
        `}
      >
        <span>
          <Label as="span">
            {resource.fullName} {resourceText ? `(${resourceText})` : ""}
          </Label>
          {` - ${memberRoles}`}
        </span>
        <Button icon={<PencilFillIcon aria-hidden />} onClick={() => setOpen(true)} size="small" variant="secondary" />
      </div>
    );
  }

  const roleOptions = Object.values(TeamRole).map((role) => ({
    value: role,
    label: intl[role],
  }));

  const onSubmitUpdatedMember = methods.handleSubmit((submittedValues) => {
    const updatedMember = {
      ...member,
      roles: submittedValues.roles,
      description: submittedValues.description,
    };
    updateMemberOfTeamMutation.mutate(updatedMember);
  });

  return (
    <form
      className={css`
        padding: 1rem;
        background: var(--a-gray-100);
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;

        > div {
          flex: 1;
          min-width: 300px;
        }
        > div:last-child {
          flex: initial;
          width: 100%;
        }
      `}
      onSubmit={onSubmitUpdatedMember}
    >
      <SelectLayoutWrapper htmlFor="name" label="Navn">
        <BasicSelect defaultValue={{ value: resource.navIdent, label: resource.fullName }} inputId="name" isDisabled />
      </SelectLayoutWrapper>
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
      <ModalActions isLoading={updateMemberOfTeamMutation.isLoading} onClose={() => methods.reset()} />
    </form>
  );
}

const validationSchema = yup.object({
  name: yup.string().required("Påkrevd"),
  roles: yup.array(yup.mixed<TeamRole>().required()).ensure().required(),
  description: yup.string().ensure().optional(),
});

type FormValues = yup.InferType<typeof validationSchema>;
