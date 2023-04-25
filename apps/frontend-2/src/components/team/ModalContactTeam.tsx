import { css } from "@emotion/css";
import { Button, Detail, Heading, Modal } from "@navikt/ds-react";

import type { ContactAddress, ProductTeam, Resource } from "../../constants";
import { TeamRole } from "../../constants";

interface modalInterface {
  team?: ProductTeam;
  contactPersonResource?: Resource;
}

type ModalTeamProperties = {
  onClose: () => void;
  title: string;
  isOpen: boolean;
  team?: ProductTeam;
  contactPersonResource?: Resource;
};

const styles = {
  modalStyles: css`
    width: 850px;
    min-height: 300px;
    padding: 1rem 1rem 2rem;
  `,
  buttonStyle: css`
    margin-top: 2em;
    width: 60%;
  `,
};

const sendEmail = (email: string) => {
  document.location.href = "mailto:" + email;
};

const copyEmail = (email: string) => {
  navigator.clipboard.writeText(email);
};

const validateContactAddresses = (contactAddresses: ContactAddress[]) => {
  let state = false;
  if (contactAddresses?.length != 0) {
    contactAddresses.map((element) => {
      if (element.type === "EPOST") {
        state = true;
      }
    });
  }
  return state;
};

const getEmail = (contactAddresses: ContactAddress[]) => {
  let email = "";
  contactAddresses.map((element) => {
    if (element.type === "EPOST") {
      email = element.address;
    }
  });
  return email;
};

const dummyArray: ContactAddress[] = [];

const contactTeamOutlook = (properties: modalInterface) => {
  const teamLeader = properties.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? undefined;
  const productOwner =
    properties.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.PRODUCT_OWNER)) ?? undefined;
  if (properties.contactPersonResource?.email != undefined) {
    sendEmail(properties.contactPersonResource.email);
  } else if (
    properties.team?.contactAddresses.length != 0 &&
    validateContactAddresses(properties.team?.contactAddresses || dummyArray)
  ) {
    sendEmail(getEmail(properties.team?.contactAddresses || dummyArray));
  } else if (teamLeader?.length != 0) {
    teamLeader?.map((element) => {
      sendEmail(element.resource.email || "");
    });
  } else if (productOwner?.length == 0) {
    alert("Ingen kontakt addresse");
  } else {
    productOwner?.map((element) => {
      sendEmail(element.resource.email || "");
    });
  }
};

const contactTeamCopy = (properties: modalInterface) => {
  const teamLeader = properties.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? undefined;
  const productOwner =
    properties.team?.members.filter((tLeader) => tLeader.roles.includes(TeamRole.PRODUCT_OWNER)) ?? undefined;
  if (properties.contactPersonResource?.email != undefined) {
    copyEmail(properties.contactPersonResource.email);
  } else if (
    properties.team?.contactAddresses.length != 0 &&
    validateContactAddresses(properties.team?.contactAddresses || dummyArray)
  ) {
    copyEmail(getEmail(properties.team?.contactAddresses || dummyArray));
  } else if (teamLeader?.length != 0) {
    teamLeader?.map((element) => {
      copyEmail(element.resource.email || "");
    });
  } else if (productOwner?.length == 0) {
    alert("Ingen kontakt addresse");
  } else {
    productOwner?.map((element) => {
      copyEmail(element.resource.email || "");
    });
  }
};

export const ModalContactTeam = (properties: ModalTeamProperties) => {
  const { onClose, title, isOpen, team, contactPersonResource } = properties;
  return (
    <>
      <Modal
        aria-label="Modal kontakt team"
        aria-labelledby="modal-heading"
        className={styles.modalStyles}
        onClose={() => {
          onClose();
        }}
        open={isOpen}
      >
        <Modal.Content>
          <Heading level="1" size="large" spacing>
            {title}
          </Heading>
          <Detail
            className={css`
              font-size: 16px;
            `}
            size="medium"
          >
            Hvis "Åpne e-postklient" knappen ikke fungerer bruk "Kopier e-post" knappen og lim dette inn i din
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
              onClick={async () => {
                await contactTeamOutlook({ team: team, contactPersonResource: contactPersonResource });
              }}
            >
              Åpne e-postklient
            </Button>
            <Button
              className={styles.buttonStyle}
              onClick={async () => {
                await contactTeamCopy({ team: team, contactPersonResource: contactPersonResource });
              }}
            >
              Kopier e-post
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};
