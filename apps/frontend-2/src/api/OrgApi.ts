import { useEffect, useState } from "react";
import axios from "axios";
import { env } from "../util/env";
// import { OrgEnhet, HierarkiData } from "../pages/OrgMainPage";
// import { agressoIdDataToUrl } from "../util/orgurls";
//
// const getOrg = async (orgId: string) => {
//   const data = (await axios.get<OrgEnhet>(`${env.teamCatalogBaseUrl}/org/${orgId}`)).data
//   return data;
// };
//
// const getHierarki: (orgId: string) => Promise<HierarkiData[]> = async (orgId: string) => {
//   const org = await getOrg(orgId);
//   const overenhet = org.organiseringer.find((o) => o.retning === "over");
//   if (overenhet) {
//     const overenhetData: HierarkiData = {
//       navn: overenhet.organisasjonsenhet.navn,
//       id: overenhet.organisasjonsenhet.agressoId,
//       orgNiv: overenhet.organisasjonsenhet.orgNiv,
//     };
//     const oe = overenhet.organisasjonsenhet;
//     const idUrl = agressoIdDataToUrl(oe.agressoId, oe.orgNiv);
//     const returnData = await getHierarki(idUrl);
//     return [...returnData, overenhetData];
//   }
//   return [] as HierarkiData[];
// };
//
// export const useOrg = (orgId: string | undefined ) => {
//   const [org, setOrg] = useState<OrgEnhet>();
//   const [orgHierarki, setOrgHierarki] = useState<HierarkiData[]>([]);
//
//   useEffect(() => {
//     if (!orgId) {
//       orgId = "0_NAV";
//     }
//     getOrg(orgId).then((r) => {
//       setOrg(r);
//     });
//
//     getHierarki(orgId).then((x) => {
//       setOrgHierarki(x);
//     });
//   }, [orgId]);
//   return { org, orgHierarki };
// };
