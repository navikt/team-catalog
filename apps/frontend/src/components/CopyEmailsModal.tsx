import { EnvelopeClosedFillIcon } from "@navikt/aksel-icons";
import { Button, CopyButton, Modal } from "@navikt/ds-react";
import { useState } from "react";
import * as React from "react";
import { useQuery } from "react-query";

import { getResourceById } from "../api/resourceApi";
import type { ProductTeamResponse } from "../constants";
import { TeamRole } from "../constants";

export function CopyEmailsModal({
  heading,
  getEmailsCallback,
}: {
  heading: string;
  getEmailsCallback: () => Promise<string>;
}) {
  const [open, setOpen] = useState(false);

  const contactEmailsQuery = useQuery({
    queryKey: ["getContactEmails"],
    queryFn: getEmailsCallback,
    staleTime: 0,
    enabled: open,
  });

  const emails = contactEmailsQuery.data ?? "";

  return (
    <>
      <Button icon={<EnvelopeClosedFillIcon />} onClick={() => setOpen(true)} size="medium" variant="secondary">
        {heading}
      </Button>
      <Modal header={{ heading }} onClose={() => setOpen(false)} open={open}>
        <Modal.Body>
          Hvis "Åpne e-postklient" knappen ikke fungerer bruk "Kopier e-poster" knappen og lim disse inn i din
          e-postklient
        </Modal.Body>
        <Modal.Footer>
          {emails.length > 0 && (
            <>
              <Button onClick={() => openEmailClient(emails)}>Åpne e-postklient</Button>
              <CopyButton activeText="E-poster kopiert" copyText={emails} text="Kopier e-poster" />
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

function openEmailClient(emails: string) {
  document.location.href = `mailto:${emails}`;
}

export async function findContactEmailForProductTeam(productTeam: ProductTeamResponse) {
  if (productTeam.contactPersonIdent) {
    const contactPerson = await getResourceById(productTeam.contactPersonIdent);
    return contactPerson.email;
  }

  const contactAddress = productTeam.contactAddresses.find(({ type }) => type === "EPOST")?.address;
  if (contactAddress) {
    return contactAddress;
  }

  const teamLeader = productTeam.members.find((member) => member.roles.includes(TeamRole.LEAD));
  if (teamLeader?.resource.email) {
    return teamLeader.resource.email;
  }

  const productOwner = productTeam.members.find((member) => member.roles.includes(TeamRole.PRODUCT_OWNER));
  if (productOwner?.resource.email) {
    return productOwner.resource.email;
  }

  return "";
}

export async function findContactEmailForSeveralTeams(productTeams: ProductTeamResponse[]) {
  const emails = await Promise.all(productTeams.map((productTeams) => findContactEmailForProductTeam(productTeams)));
  return emails.filter((email) => email.length > 0).join("; ");
}
