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
  tags: string[];
  members: ProductAreaMember[];
  changeStamp?: ChangeStamp;
}

export interface ProductAreaFormValues {
  id?: string;
  name: string;
  description: string;
  tags: string[];
  members: ProductAreaMemberFormValues[];
}

export interface ProductTeam {
  id: string;
  name: string;
  description: string;
  slackChannel: string;
  productAreaId: string;
  naisTeams: string[];
  members: TeamMember[];
  teamLeadQA: boolean;
  teamType: TeamType;
  changeStamp?: ChangeStamp;
  tags: string[];
}

export interface ProductTeamFormValues {
  id?: string;
  name: string;
  description: string;
  slackChannel: string;
  productAreaId: string;
  naisTeams: string[];
  members: TeamMemberFormValues[];
  teamLeadQA: boolean;
  teamType: TeamType;
  tags: string[];
}

export interface TeamMemberFormValues {
  navIdent: string;
  roles: TeamRole[];
  description?: string;

  // Visual only, not for submit
  name?: string;
  resourceType?: ResourceType;
}

export interface ProductAreaMemberFormValues {
  navIdent: string;
  description?: string;

  // Visual only, not for submit
  name?: string;
  resourceType?: ResourceType;
}

export interface TeamMember {
  navIdent: string;
  roles: TeamRole[];
  description?: string;
  resource: Partial<Resource>
}

export interface ProductAreaMember {
  navIdent: string;
  description?: string;
  resource: Partial<Resource>
}

export interface Resource {
  navIdent: string;
  email: string;
  familyName: string;
  fullName: string;
  givenName: string;
  startDate: string;
  endDate?: string;
  resourceType: ResourceType;
  stale: boolean
}
