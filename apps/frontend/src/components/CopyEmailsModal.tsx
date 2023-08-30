import { EnvelopeClosedFillIcon } from "@navikt/aksel-icons";
import { Button, CopyButton, Modal } from "@navikt/ds-react";
import { useState } from "react";
import * as React from "react";

export function CopyEmailsModal({ heading, emails }: { heading: string; emails: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<EnvelopeClosedFillIcon />} onClick={() => setOpen(true)} size="medium" variant="secondary">
        Kontakt alle team
      </Button>
      <Modal header={{ heading }} onClose={() => setOpen(false)} open={open}>
        <Modal.Body>
          Hvis "Åpne e-postklient" knappen ikke fungerer bruk "Kopier e-poster" knappen og lim disse inn i din
          e-postklient
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => openEmailClient(emails)}>Åpne e-postklient</Button>
          <CopyButton activeText="E-poster kopiert" copyText={emails.join("; ")} text="Kopier e-poster" />
        </Modal.Footer>
      </Modal>
    </>
  );
}

function openEmailClient(emails: string[]) {
  document.location.href = "mailto:" + emails.join("; ");
}

// function find
// Danish.Amjad@nav.no