import { useEffect, useState } from "react";

import { useResourceSearch } from "../../api";
import type { MemberFormValues, MemberSubmitValues } from "../../constants";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import { Controller, useForm } from "react-hook-form";
import { Heading, Modal } from "@navikt/ds-react";
import * as React from "react";
import { css } from "@emotion/css";
import { StylesConfig } from "react-select";

type ModalMembersProperties = {
  onClose: () => void;
  title: string;
  initialValues: MemberFormValues[];
  isOpen: boolean;
  onSubmitForm: (values: MemberSubmitValues[]) => void;
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

const customStyles: StylesConfig<any> = {
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

const ModalMembers = (properties: ModalMembersProperties) => {
  const { onClose, title, initialValues, isOpen, onSubmitForm } = properties;
  const [searchResultPerson, setResourceSearchPerson, loadingPerson] = useResourceSearch();
  const [otherComment, setOtherComment] = useState<string>();
  const [memberRole, setMemberRole] = useState<TeamRole>();

  const roleOptions = Object.values(TeamRole).map((tr) => ({
    value: Object.keys(TeamRole)[Object.values(TeamRole).indexOf(tr as TeamRole)],
    label: intl[tr],
  }));

  //TODO placeholder for senere
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useEffect(() => {}), [isOpen, initialValues];

  return(
    <form>
      <Modal
        aria-label="Modal team edit"
        aria-labelledby="modal-heading"
        className={styles.modalStyles}
        onClose={() => onClose()}
        open={isOpen}
      >
        <Modal.Content>
          <Heading level="1" size="large" spacing>
            {title}
          </Heading>
        </Modal.Content>
      </Modal>
    </form>
  );
};

export default ModalMembers;
