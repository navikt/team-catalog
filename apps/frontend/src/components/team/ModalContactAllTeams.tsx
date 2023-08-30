import { EnvelopeClosedFillIcon } from "@navikt/aksel-icons";
import { Button, Modal } from "@navikt/ds-react";
import * as React from "react";
import { useState } from "react";

import { getResourceById } from "../../api/resourceApi";
import type { ContactAddress, ProductTeamResponse } from "../../constants";
import { TeamRole } from "../../constants";

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
      }),
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
      }),
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

export const ModalContactAllTeams = ({ teams }: { teams: ProductTeamResponse[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<EnvelopeClosedFillIcon />} onClick={() => setOpen(true)} size="medium" variant="secondary">
        Kontakt alle team
      </Button>
      <Modal header={{ heading: "Kontakt alle teamene" }} onClose={() => setOpen(false)} open={open}>
        <Modal.Body>
          Hvis "Åpne e-postklient" knappen ikke fungerer bruk "Kopier e-poster" knappen og lim disse inn i din
          e-postklient
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={async () => {
              await contactTeamsOutlook(teams);
            }}
          >
            Åpne e-postklient
          </Button>
          {/*TODO: Should give feedback that text was copied*/}
          <Button
            onClick={async () => {
              await contactTeamsCopy(teams);
            }}
          >
            Kopier e-poster
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
