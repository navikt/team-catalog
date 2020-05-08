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
  DEVELOPER = "DEVELOPER",
  TESTER = "TESTER",
  LEAD = "LEAD",
  TECH_LEAD = "TECH_LEAD",
  TEST_LEAD = "TEST_LEAD",
  AGILE_COACH = "AGILE_COACH",
  ARCHITECT = "ARCHITECT",
  DATA_MANAGER = "DATA_MANAGER",
  DATA_SCIENTIST = "DATA_SCIENTIST",
  DESIGNER = "DESIGNER",
  DOMAIN_EXPERT = "DOMAIN_EXPERT",
  OPERATIONS = "OPERATIONS",
  DOMAIN_RESPONSIBLE = "DOMAIN_RESPONSIBLE",
  DOMAIN_RESOURCE = "DOMAIN_RESOURCE",
  BUSINESS_ANALYST = "BUSINESS_ANALYST",
  FUNCTIONAL_ADVISER = "FUNCTIONAL_ADVISER",
  SOLUTION_ARCHITECT = "SOLUTION_ARCHITECT",
  PRODUCT_OWNER = "PRODUCT_OWNER",
  SECURITY_ARCHITECT = "SECURITY_ARCHITECT",
  TECHNICAL_ADVISER = "TECHNICAL_ADVISER",
  TECHNICAL_TESTER = "TECHNICAL_TESTER",
  MAINTENANCE_MANAGER = "MAINTENANCE_MANAGER",
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
  members: MemberFormValues[];
  teamLeadQA: boolean;
  teamType: TeamType;
}

export interface MemberFormValues {
  navIdent: string;
  roles: TeamRole[];
  description?: string;

  // Visual only, not for submit
  name?: string;
  resourceType?: ResourceType;
}

export interface Member {
  navIdent: string;
  name: string;
  roles: TeamRole[];
  description?: string;
  email: string;
  startDate?: string;
  endDate?: string;
  resourceType: ResourceType;
}

export interface Resource {
  email: string;
  familyName: string;
  fullName: string;
  givenName: string;
  navIdent: string;
  startDate: string;
  endDate?: string;
  resourceType: ResourceType;
}
