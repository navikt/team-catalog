import type { Member } from "../../constants";
import { CardContainer, MemberCard } from "./Card";

type MembersNewProperties = {
  members: Member[];
};

const Members = (properties: MembersNewProperties) => {
  const { members } = properties;

  if (members.length === 0) {
    return <p>Ingen medlemmer i teamet.</p>;
  }
  return (
    <CardContainer>
      {members.map((member: Member) => (
        <MemberCard key={member.navIdent} member={member} />
      ))}
    </CardContainer>
  );
};

export default Members;
