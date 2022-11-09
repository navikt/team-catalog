import { css } from "@emotion/css";
import { Loader } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { Membership } from "../api";
import { getAllMemberships, getResourceById, getResourceUnitsById } from "../api";
import PageTitle from "../components/PageTitle";
import ResourceAffiliation from "../components/Resource/ResourceAffiliation";
import ResourceOrgAffiliation from "../components/Resource/ResourceOrgAffiliation";
import ShortSummaryResource from "../components/Resource/ShortSummaryResource";
import { UserImage } from "../components/UserImage";
import type { Resource, ResourceUnits } from "../constants";
import { Status } from "../constants";

const ResourcePage = () => {
  const { navIdent } = useParams<{ navIdent: string }>();
  const [resource, setResource] = useState<Resource>();
  const [unit, setUnits] = useState<ResourceUnits>();
  const [memberships, setMemberships] = useState<Membership>({ clusters: [], productAreas: [], teams: [] });
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resource = await getResourceById(navIdent);
        setResource(resource);
        const memberships = await getAllMemberships(resource.navIdent);
        setMemberships(memberships);
      } catch (error) {
        setResource(undefined);
        console.log("Something went wrong", error);
      }
      getResourceUnitsById(navIdent)
        .then(setUnits)
        .catch(() => console.debug(`cant find units for ${navIdent}`));
      setLoading(false);
    })();
  }, [navIdent]);

  const filteredTeams = memberships.teams.filter((team) => team.status == Status.ACTIVE);
  const filteredClusters = memberships.clusters.filter((cluster) => cluster.status == Status.ACTIVE);
  const filteredAreas = memberships.productAreas.filter((area) => area.status == Status.ACTIVE);

  return !isLoading && resource ? (
    <>
      <div
        className={css`
          display: flex;
          width: 100%;
          align-items: center;
        `}
      >
        <div
          className={css`
            margin-right: 1rem;
          `}
        >
          <UserImage ident={resource?.navIdent} size="100px" />
        </div>
        <PageTitle
          title={`${resource?.fullName} ${
            resource?.endDate && dayjs(resource?.endDate).isBefore(dayjs()) ? "(Inaktiv)" : ""
          }`}
        />

        {/* {resource?.resourceType === ResourceType.EXTERNAL && <div>{intl.EXTERNAL}</div>}
          {resource?.resourceType === ResourceType.OTHER && `(${intl.nonNavEmployee})`} */}
      </div>

      <div
        className={css`
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-column-gap: 3rem;
          margin-top: 2rem;
        `}
      >
        <ShortSummaryResource resource={resource} />
        <ResourceAffiliation
          clusters={filteredClusters}
          productAreas={filteredAreas}
          resource={resource}
          teams={filteredTeams}
        />
        <ResourceOrgAffiliation resource={resource} units={unit} />
      </div>

      {/* <Block display="flex" width="100%">
        <Block width="30%">
          <TextWithLabel label={'NAV-Ident'} text={resource?.navIdent} />
          <TextWithLabel label={'Type'} text={resource?.resourceType && intl[resource.resourceType]} />
          <TextWithLabel label={'E-post'} text={resource?.email} />
          <TextWithLabel label={'Startdato'} text={resource?.startDate && moment(resource.startDate).format('ll')} />
          {resource?.endDate && <TextWithLabel label={'Slutt dato'} text={moment(resource.endDate).format('ll')} />}
        </Block>

        <Block marginTop="0" paddingLeft={theme.sizing.scale800} display="flex">
          <TextWithLabel label={''} text={resource?.navIdent && <UserImage ident={resource.navIdent} size={'200px'} />} />
          {resource && <UserBadges memberships={memberships} resource={resource} />}
        </Block>
      </Block> */}

      {/* <Block>
        <Tabs activeKey={tab} onChange={(p) => setTab(p.activeKey as number)} fill={'fixed'}>
          <Tab title={<HeadingSmall marginBottom={0}>Knytning til team og områder</HeadingSmall>}>
            <Block marginTop="2rem">
              <CardList teams={filteredTeams} productAreas={filteredAreas} clusters={filteredClusters} resource={resource} />
            </Block>
          </Tab>
          <Tab title={<HeadingSmall marginBottom={0}>Organisatorisk tilhørighet</HeadingSmall>}>
            <Block marginTop="2rem">
              {resource && unit && <Units resource={resource} units={unit} />}
              {!unit?.units?.length && <ParagraphSmall>Ingen informasjon</ParagraphSmall>}
            </Block>
          </Tab>
        </Tabs>
      </Block> */}
    </>
  ) : (
    <Loader size="medium" />
  );
};

// const Units = (props: { resource: Resource; units: ResourceUnits }) => {
//   const { units, members } = props.units
//   const resource = props.resource

//   const teams = useAllTeams()
//   const areas = useAllProductAreas()
//   const clusters = useAllClusters()

//   const labelProps = {
//     width: '305px',
//     paddingRight: theme.sizing.scale200,
//     wordBreak: 'break-word',
//   }

//   return (
//     <Block display="flex" flexDirection={'column'}>
//       <Block>
//         {units.map((u, i) => (
//           <Block key={resource.navIdent + i} display={'flex'} flexWrap>
//             <Block>
//               <TextWithLabel label={'Ansatt i'} {...labelProps} text={<RouteLink href={`/org/${agressoIdDataToUrl(u.id, u.niva || '')}`}>{u.name}</RouteLink>} />
//             </Block>
//             {u.parentUnit && (
//               <Block>
//                 <TextWithLabel
//                   label={'Avdeling'}
//                   text={<RouteLink href={`/org/${agressoIdDataToUrl(u.parentUnit.id, u.parentUnit.niva || '')}`}>{u.parentUnit.name}</RouteLink>}
//                   {...labelProps}
//                 />
//               </Block>
//             )}
//             {u.leader && (
//               <TextWithLabel
//                 label={'Leder'}
//                 text={
//                   <ObjectLink type={ObjectType.Resource} id={u.leader.navIdent}>
//                     {u.leader.fullName}
//                   </ObjectLink>
//                 }
//               />
//             )}
//           </Block>
//         ))}
//       </Block>

//       {!!members.length && (
//         <Block>
//           <HeadingXSmall>
//             {resource.fullName} er leder for
//             <RouteLink href={`/dashboard/members/leader/${resource.navIdent}`} $style={{ marginLeft: theme.sizing.scale800 }}>
//               <span>
//                 <FontAwesomeIcon icon={faTable} />
//               </span>
//             </RouteLink>
//           </HeadingXSmall>
//           <Block display={'flex'} flexDirection={'column'}>
//             {members
//               .sort((a, b) => a.fullName.localeCompare(b.fullName))
//               .map((m, i) => (
//                 <Block display={'flex'} marginBottom={theme.sizing.scale400} paddingBottom={theme.sizing.scale400} key={m.navIdent} $style={{ borderBottom: '1px solid #DDD' }}>
//                   <ResourceHead resource={m} />

//                   <Block display={'flex'} flexDirection={'column'} marginTop={theme.sizing.scale400}>
//                     <WorkConnections ident={m.navIdent} type={ObjectType.Team} items={teams} />
//                     <WorkConnections ident={m.navIdent} type={ObjectType.ProductArea} items={areas} />
//                     <WorkConnections ident={m.navIdent} type={ObjectType.Cluster} items={clusters} />
//                   </Block>
//                 </Block>
//               ))}
//           </Block>
//         </Block>
//       )}
//     </Block>
//   )
// }

// const ResourceHead = (props: { resource: Resource }) => {
//   const m = props.resource
//   const [hover, setHover] = useState(false)
//   return (
//     <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
//       <ObjectLink id={m.navIdent} type={ObjectType.Resource} hideUnderline>
//         <Block display={'flex'} flexDirection={'column'} alignItems={'center'} width={theme.sizing.scale4800} marginRight={theme.sizing.scale600}>
//           <UserImage ident={m.navIdent} size={'60px'} disableRefresh border={hover} />
//           <ParagraphSmall
//             marginTop={theme.sizing.scale100}
//             marginBottom={0}
//             $style={{
//               textDecoration: hover ? 'underline' : undefined,
//               wordBreak: 'break-word',
//               textAlign: 'center',
//             }}
//           >
//             {m.fullName}
//           </ParagraphSmall>
//         </Block>
//       </ObjectLink>
//     </div>
//   )
// }

// const WorkConnections = (props: { ident: string; type: ObjectType; items: { id: string; name: string; members: { navIdent: string; roles: TeamRole[] }[] }[] }) => {
//   const connections = props.items.map((t) => ({ id: t.id, name: t.name, roles: t.members.find((tm) => tm.navIdent === props.ident)?.roles })).filter((t) => !!t.roles?.length)

//   if (!connections.length) {
//     return null
//   }

//   return (
//     <>
//       {connections.map((t, i) => (
//         <ParagraphSmall marginTop={0} marginBottom={theme.sizing.scale100} key={i}>
//           <ObjectLink id={t.id} type={props.type}>
//             {t.name}
//           </ObjectLink>{' '}
//           - {t.roles!.map((r) => intl[r]).join(', ')}
//         </ParagraphSmall>
//       ))}
//     </>
//   )
// }

const hasNoMemberships = (membership: Membership) => {
  return membership.teams.length === 0 && membership.clusters.length === 0 && membership.productAreas.length === 0;
};

export default ResourcePage;
