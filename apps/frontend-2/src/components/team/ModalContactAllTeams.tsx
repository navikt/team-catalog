import { css } from "@emotion/css";
import { Button, Detail, Heading, Modal } from "@navikt/ds-react";

import { getResourceById } from "../../api/resourceApi";
import type { ContactAddress, ProductTeamResponse } from "../../constants";
import { TeamRole } from "../../constants";

type ModalTeamProperties = {
  onClose: () => void;
  title: string;
  isOpen: boolean;
  teams: ProductTeamResponse[];
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

const contactTeamsOutlook = async (productTeams: ProductTeamResponse[]) => {
  let emails = "";
  (
    await Promise.all(
      productTeams.map((pt: ProductTeamResponse) => {
        return getContactAddress(pt);
      })
    )
  )
    .filter(Boolean)
    .map((email) => {
      emails += email + "; ";
    });
  document.location.href = "mailto:" + emails;
};

const contactTeamsCopy = async (productTeams: ProductTeamResponse[]) => {
  let emails = "";
  (
    await Promise.all(
      productTeams.map((pt: ProductTeamResponse) => {
        return getContactAddress(pt);
      })
    )
  )
    .filter(Boolean)
    .map((email) => {
      emails += email + "; ";
    });
  await navigator.clipboard.writeText(emails);
};

const getContactAddress = async (productTeam: ProductTeamResponse) => {
  const teamLeader = productTeam.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? undefined;
  const productOwner = productTeam.members.filter((po) => po.roles.includes(TeamRole.PRODUCT_OWNER)) ?? undefined;
  let contactAddress = "";
  if (productTeam.contactPersonIdent) {
    const response = await getResourceById(productTeam.contactPersonIdent);
    contactAddress = response.email;
  } else if (productTeam.contactAddresses.length > 0 && validateContactAddresses(productTeam.contactAddresses)) {
    contactAddress = getEmail(productTeam.contactAddresses);
  } else if (teamLeader.length > 0) {
    teamLeader.map((element) => {
      contactAddress = element.resource.email || "";
    });
  } else if (productOwner.length > 0) {
    productOwner.map((element) => {
      contactAddress = element.resource.email || "";
    });
  }
  return contactAddress;
};

export const ModalContactAllTeams = (properties: ModalTeamProperties) => {
  const { onClose, title, isOpen, teams } = properties;
  return (
    <>
      <Modal
        aria-label="Modal kontakt alle team"
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
              onClick={async () => {
                await contactTeamsOutlook(teams);
              }}
            >
              Åpne e-postklient
            </Button>
            <Button
              className={styles.buttonStyle}
              onClick={async () => {
                await contactTeamsCopy(teams);
              }}
            >
              Kopier e-poster
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};
