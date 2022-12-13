import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import areaIcon from "../../assets/areaBlue.svg";
import clusterIcon from "../../assets/clusterBlue.svg";
import teamIcon from "../../assets/teamBlue.svg";
import type {Cluster, Member, ProductTeam, SimpleResource} from "../../constants";
import type { ProductArea } from "../../constants";
import { intl } from "../../util/intl/intl";
import { linkCardStyle } from "../../util/styles";
import { UserImage } from "../UserImage";

export function ClusterCard({ cluster }: { cluster: Cluster }) {
  const { navIdent } = useParams<{ navIdent?: string }>();
  const roles = getRolesForNavIdent(cluster.members, navIdent);
  return (
    <Card icon={<img src={clusterIcon} />} title={cluster.name} url={`/cluster/${cluster.id}`}>
      {roles.length > 0 && <CardItem text={roles.join(", ")} title="Roller" />}
      <CardItem text={cluster.members.length.toString()} title="Medlemmer" />
    </Card>
  );
}

export function TeamCard({ team }: { team: ProductTeam }) {
  const { navIdent } = useParams<{ navIdent?: string }>();

  const numberOfTeamMembers = team.members.length.toString();
  const roles = getRolesForNavIdent(team.members, navIdent);
  return (
    <Card icon={<img src={teamIcon} width={75} />} title={team.name} url={`/team/${team.id}`}>
      {roles.length > 0 && <CardItem text={roles.join(", ")} title="Roller" />}
      <CardItem text={numberOfTeamMembers} title="Medlemmer" />
    </Card>
  );
}

export function AreaCard({ area }: { area: ProductArea }) {
  const { navIdent } = useParams<{ navIdent?: string }>();
  const roles = getRolesForNavIdent(area.members, navIdent);
  return (
    <Card icon={<img src={areaIcon} />} title={area.name} url={`/area/${area.id}`}>
      {roles.length > 0 && <CardItem text={roles.join(", ")} title="Roller" />}
      <CardItem text={area.members.length.toString()} title="Medlemmer" />
    </Card>
  );
}

export function MemberCard({ member }: { member: Member }) {
  const roles = member.roles.map((role) => intl[role]);

  const res : SimpleResource= {
    navIdent: member.navIdent,
    fullName: member.resource.fullName || member.navIdent
  }

  return (
    <Card
      icon={<UserImage resource={res} size="100px" />}
      title={member.resource.fullName ?? "-"}
      url={`/resource/${member.navIdent}`}
    >
      {roles.length > 0 && <CardItem text={roles.join(", ")} title="Roller" />}
      {member.description && <CardItem text={member.description} title="Annet" />}
    </Card>
  );
}

export function CardItem({ title, text }: { title: string; text: string }) {
  return (
    <div
      className={css`
        color: black;
        font-weight: var(--navds-font-weight-regular);
      `}
    >
      <span>{title}: </span>
      <b>{text}</b>
    </div>
  );
}

export function CardContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={css`
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      `}
    >
      {children}
    </div>
  );
}

function Card({ title, icon, children, url }: { title: string; icon: ReactNode; children: ReactNode; url: string }) {
  return (
    <Link
      className={css(
        linkCardStyle,
        css`
          display: flex;
          background: white;
          padding: 20px 24px;
          gap: 1rem;
          width: 100%;
          height: 100%;
          justify-content: space-between;
          flex-direction: row;

          &:hover {
            background: var(--navds-global-color-deepblue-50);
          }
        `
      )}
      to={url}
    >
      <div>
        <Heading
          className={css`
            margin-bottom: 0.5rem;
          `}
          level="3"
          size="small"
        >
          {title}
        </Heading>
        <div
          className={css`
            display: flex;
            gap: 0.25rem;
            flex-direction: column;
          `}
        >
          {children}
        </div>
      </div>
      {icon}
    </Link>
  );
}

function getRolesForNavIdent(members: Member[], navIdent: string | undefined) {
  if (!navIdent) {
    return [];
  }
  return members.find((member) => member.navIdent === navIdent)?.roles.map((role) => intl[role]) ?? [];
}
