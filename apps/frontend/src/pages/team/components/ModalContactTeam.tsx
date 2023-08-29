import { BodyShort, Button, Modal } from "@navikt/ds-react";
import { useQuery } from "react-query";

import { getResourceById } from "../../../api/resourceApi";
import type { ContactAddress, ProductTeamResponse, Resource } from "../../../constants";
import { TeamRole } from "../../../constants";

type ContactInfo = {
  team: ProductTeamResponse;
  contactPersonResource?: Resource;
};

type ModalTeamProperties = {
  onClose: () => void;
  title: string;
  isOpen: boolean;
  team: ProductTeamResponse;
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

const contactTeamOutlook = (properties: ContactInfo) => {
  const teamLeader = properties.team.members.filter((tLeader) => tLeader.roles.includes(TeamRole.LEAD)) ?? undefined;
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

const contactTeamCopy = (properties: ContactInfo) => {
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
  const { onClose, title, isOpen, team } = properties;

  const fetchContactPersonResource = useQuery({
    queryKey: ["getResourceById", team.contactPersonIdent],
    queryFn: () => getResourceById(team.contactPersonIdent),
    enabled: !!team.contactPersonIdent,
  });

  return (
    <Modal header={{ heading: title }} onClose={onClose} open={isOpen}>
      <Modal.Body>
        <BodyShort spacing>
          Hvis "Åpne e-postklient" knappen ikke fungerer bruk "Kopier e-post" knappen og lim dette inn i din
          e-postklient
        </BodyShort>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => contactTeamOutlook({ team: team, contactPersonResource: fetchContactPersonResource.data })}
        >
          Åpne e-postklient
        </Button>
        <Button onClick={() => contactTeamCopy({ team: team, contactPersonResource: fetchContactPersonResource.data })}>
          Kopier e-post
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
