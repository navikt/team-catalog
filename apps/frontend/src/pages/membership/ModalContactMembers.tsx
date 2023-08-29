import { css } from "@emotion/css";
import { Button, Detail, Modal } from "@navikt/ds-react";
import * as React from "react";
import { Fragment } from "react";

import type { Membership } from "./MembershipsPage";

type ModalMembersProperties = {
  onClose: () => void;
  title: string;
  isOpen: boolean;
  memberships: Membership[];
};

const styles = {
  modalStyles: css`
    width: 850px;
    min-height: 300px;
    padding: 1rem;
    padding-bottom: 2rem;
  `,
  buttonStyle: css`
    margin-top: 2em;
    width: 60%;
  `,
};

const contactMembersOutlook = (memberships: Membership[]) => {
  const emails = memberships.map((membership) => membership.member.resource.email);
  document.location.href = "mailto:" + emails.join("; ");
};

const contactTeamsCopy = (memberships: Membership[]) => {
  const emails = memberships.map((membership) => membership.member.resource.email || "");
  navigator.clipboard.writeText(emails.join("; "));
};

export const ModalContactMembers = (properties: ModalMembersProperties) => {
  const { onClose, title, isOpen, memberships } = properties;
  return (
    <Fragment>
      <Modal className={styles.modalStyles} header={{ heading: title }} onClose={onClose} open={isOpen}>
        <Modal.Body>
          <Detail
            className={css`
              font-size: 16px;
            `}
          >
            Hvis "Åpne e-postklient" knappen ikke fungerer bruk "Kopier e-poster" knappen og lim disse inn i din
            e-postklient
          </Detail>
          <div
            className={css`
              display: flex;
              flex-direction: column;
              align-items: center;
            `}
          >
            <Button
              className={styles.buttonStyle}
              onClick={() => {
                contactMembersOutlook(memberships);
              }}
            >
              Åpne e-postklient
            </Button>
            <Button
              className={styles.buttonStyle}
              onClick={() => {
                contactTeamsCopy(memberships);
              }}
            >
              Kopier e-poster
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};
