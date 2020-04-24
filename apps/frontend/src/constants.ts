import {ColumnCompares} from "./util/hooks";
import {intl} from "./util/intl/intl";

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

export enum TeamType {
  PRODUCT = 'PRODUCT',
  ADMINISTRATION = 'ADMINISTRATION',
  IT = 'IT',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
}

export enum TeamRole {
  LEAD = "LEAD",
  DEVELOPER = "DEVELOPER",
  TESTER = "TESTER",
  TECH_LEAD = "TECH_LEAD",
  TEST_LEAD = "TEST_LEAD",
  PRODUCT_OWNER = "PRODUCT_OWNER",
  SECURITY_ARCHITECT = "SECURITY_ARCHITECT",
  SOLUTION_ARCHITECT = "SOLUTION_ARCHITECT",
  ARCHITECT = "ARCHITECT",
  AGILE_COACH = "AGILE_COACH",
  DATA_MANAGER = "DATA_MANAGER",
  DATA_SCIENTIST = "DATA_SCIENTIST",
  DESIGNER = "DESIGNER",
  OTHER = "OTHER",
}

export enum ResourceType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL"
}

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  pages: number;
  numberOfElements: number;
  totalElements: number;
  content: T[];
}

export interface ChangeStamp {
  lastModifiedBy: string;
  lastModifiedDate: string;
}

export interface UserInfo {
  loggedIn: boolean;
  groups: string[];
  ident?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
}

export interface ProductArea {
  id: string;
  name: string;
  description: string;
  changeStamp?: ChangeStamp;
}

export interface ProductAreaFormValues {
  id?: string;
  description: string;
  name: string;
}

export interface ProductTeam {
  id: string;
  name: string;
  description: string;
  slackChannel: string;
  productAreaId: string;
  naisTeams: string[];
  members: Member[];
  teamLeadQA: boolean;
  teamType: TeamType;
  changeStamp?: ChangeStamp;
}

export interface ProductTeamFormValues {
  id?: string;
  name: string;
  description: string;
  slackChannel: string;
  productAreaId: string;
  naisTeams: string[];
  members: Member[];
  teamLeadQA: boolean;
  teamType: TeamType;
}

export interface Member {
  navIdent: string;
  name: string;
  roles: TeamRole[];
  description?: string;
  email: string;
  resourceType: ResourceType;
}

export interface Resource {
  email: string;
  familyName: string;
  fullName: string;
  givenName: string;
  navIdent: string;
  resourceType: string;
  startDate: string;
  email: string;
  resourceType: ResourceType;
}

export const productTeamSort: ColumnCompares<ProductTeam> = {
  name: (a, b) => a.name.localeCompare(b.name, intl.getLanguage()),
  slackChannel: (a, b) => (a.slackChannel || "").localeCompare(b.slackChannel || "", intl.getLanguage()),
  // informationType: (a, b) => a.informationType.name.localeCompare(b.informationType.name),
  // process: (a, b) => (a.process?.name || "").localeCompare(b.process?.name || ""),
  // subjectCategories: (a, b) => codelist.getShortnameForCode(a.subjectCategories[0]).localeCompare(codelist.getShortnameForCode(b.subjectCategories[0]), intl.getLanguage()),
  // legalBases: (a, b) => a.legalBases.length - b.legalBases.length
};
