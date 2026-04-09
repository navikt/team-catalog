import "dayjs/locale/nb";

import type { GlobalStrings, LocalizedStringsMethods } from "react-localization";
import LocalizedStrings from "react-localization";

import { en, no } from "./lang";

export interface IStrings {
  PRODUCT: string;
  PRODUCT_DESCRIPTION: string;
  ADMINISTRATION: string;
  ADMINISTRATION_DESCRIPTION: string;
  IT: string;
  IT_DESCRIPTION: string;
  PROJECT: string;
  PROJECT_DESCRIPTION: string;
  OTHER: string;
  OTHER_DESCRIPTION: string;
  UNKNOWN: string;
  UNKNOWN_DESCRIPTION: string;
  edit: string;
  dataIsMissing: string;

  PRODUCT_AREA_AREATYPE_DESCRIPTION: string;
  PROJECT_AREATYPE_DESCRIPTION: string;
  IT_AREATYPE_DESCRIPTION: string;
  OTHER_AREATYPE_DESCRIPTION: string;

  CREATE: string;
  UPDATE: string;
  DELETE: string;

  INTERNAL: string;
  EXTERNAL: string;

  nonNavEmployee: string;

  AREA: string;
  TEAM: string;
  Team: string;
  ProductArea: string;
  Cluster: string;

  AGILE_COACH: string;
  ARCHITECT: string;
  AREA_LEAD: string;
  BUSINESS_ANALYST: string;
  COMMUNICATION_ADVISER: string;
  CONTROLLER: string;
  DATA_ENGINEER: string;
  DATA_MANAGER: string;
  DATA_SCIENTIST: string;
  DESIGNER: string;
  DESIGN_LEAD: string;
  DESIGN_RESEARCHER: string;
  DEVELOPER: string;
  DISCIPLINE_AND_DELIVERY_MANAGER: string;
  DISCIPLINE_DIRECTOR: string;
  DOMAIN_EXPERT: string;
  DOMAIN_RESOURCE: string;
  DOMAIN_RESPONSIBLE: string;
  FRONTEND: string;
  FUNCTIONAL_ADVISER: string;
  HEAD_OF_LEGAL: string;
  LEAD: string;
  LEADER: string;
  LEGAL_ADVISER: string;
  MAINTENANCE_MANAGER: string;
  OPERATIONS: string;
  PERSONELLROSTER_RESPONSIBLE: string;
  PLATFORM_SYSTEM_TECHNICIAN: string;
  PRINCIPAL: string;
  PRODUCT_LEAD: string;
  PROJECT_MANAGER: string;
  PROFIT_COACH: string;
  SECURITY_ARCHITECT: string;
  SECURITY_CHAMPION: string;
  SOLUTION_ARCHITECT: string;
  STAFFING_MANAGER: string;
  STRATEGIC_PRODUCT_LEAD: string;
  SUBJECT_MATTER_EXPERT: string;
  TEAMCOACH: string;
  TECH_DOMAIN_SPECIALIST: string;
  TECH_LEAD: string;
  TECHNICAL_ADVISER: string;
  TECHNICAL_TESTER: string;
  TECHNOLOGY_LEAD: string;
  TESTER: string;
  TEST_LEAD: string;
  UU_CHAMPION: string;
  UU_SPECIALIST: string;
  VISUAL_ANALYTICS_ENGINEER: string;
  WEB_ANALYST: string;

  STREAM_ALIGNED: string;
  ENABLING: string;
  PLATFORM: string;
  COMPLICATED_SUBSYSTEM: string;
  WORKGROUP: string;
  MANAGEMENT: string;
  PROJECTGROUP: string;

  STREAM_ALIGNED_DESCRIPTION: string;
  ENABLING_DESCRIPTION: string;
  PLATFORM_DESCRIPTION: string;
  COMPLICATED_SUBSYSTEM_DESCRIPTION: string;
  WORKGROUP_DESCRIPTION: string;
  MANAGEMENT_DESCRIPTION: string;
  PROJECTGROUP_DESCRIPTION: string;

  administrate: string;
  emptyTable: string;
  audits: string;
  audit: string;
  mailLog: string;
  searchId: string;
  id: string;
  user: string;
  time: string;
  rows: string;
  action: string;
  lastChanges: string;
  table: string;
  auditNotFound: string;
  view: string;
  auditNr: string;
  close: string;
  version: string;
  nextButton: string;
  prevButton: string;
  settings: string;
  abort: string;
  save: string;
  pageNotFound: string;
  teamNotFound: string;
  productAreaNotFound: string;
  clusterNotFound: string;
  linkToAllTeamsText: string;
  linkToAllProductAreasText: string;
  ACTIVE: string;
  PLANNED: string;
  INACTIVE: string;
}

// Remember import moment locales up top
export const langs: Langs = {
  nb: { flag: "no", name: "Norsk", langCode: "nb", texts: no },
  en: { flag: "gb", name: "English", langCode: "en", texts: en },
};

// Controls starting language as well as fallback language if a text is missing in chosen language
const defaultLang = langs.nb;

type IIntl = LocalizedStringsMethods & IStrings;

interface LocalizedStringsFactory {
  new <T>(properties: GlobalStrings<T>, options?: { customLanguageInterface: () => string }): IIntl;
}

const strings: IntlLangs = {};

for (const lang of Object.keys(langs)) strings[lang] = langs[lang].texts;

export const intl: IIntl = new (LocalizedStrings as LocalizedStringsFactory)(strings, {
  customLanguageInterface: () => defaultLang.langCode,
});

interface IntlLangs {
  [lang: string]: IStrings;
}

export interface Lang {
  flag: string;
  name: string;
  langCode: string;
  texts: IStrings;
}

interface Langs {
  [lang: string]: Lang;
}
