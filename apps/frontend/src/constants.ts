export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P]
}

type Not<T> = { [key in keyof T]?: never }
export type Or<T, U> = (T & Not<U>) | (U & Not<T>)

export enum AreaType {
  PRODUCT_AREA = 'PRODUCT_AREA',
  IT = 'IT',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
}

export enum Status {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TeamOwnershipType {
  PRODUCT = 'PRODUCT',
  ADMINISTRATION = 'ADMINISTRATION',
  IT = 'IT',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

export enum TeamRole {
  DEVELOPER = 'DEVELOPER',
  TESTER = 'TESTER',
  LEAD = 'LEAD',
  TECH_DOMAIN_SPECIALIST = 'TECH_DOMAIN_SPECIALIST',
  TECH_LEAD = 'TECH_LEAD',
  TEST_LEAD = 'TEST_LEAD',
  AGILE_COACH = 'AGILE_COACH',
  ARCHITECT = 'ARCHITECT',
  CONTROLLER = 'CONTROLLER',
  DATA_MANAGER = 'DATA_MANAGER',
  DATA_SCIENTIST = 'DATA_SCIENTIST',
  DESIGNER = 'DESIGNER',
  DOMAIN_EXPERT = 'DOMAIN_EXPERT',
  OPERATIONS = 'OPERATIONS',
  DOMAIN_RESPONSIBLE = 'DOMAIN_RESPONSIBLE',
  DOMAIN_RESOURCE = 'DOMAIN_RESOURCE',
  BUSINESS_ANALYST = 'BUSINESS_ANALYST',
  FUNCTIONAL_ADVISER = 'FUNCTIONAL_ADVISER',
  PROFIT_COACH = 'PROFIT_COACH',
  LEGAL_ADVISER = 'LEGAL_ADVISER',
  COMMUNICATION_ADVISER = 'COMMUNICATION_ADVISER',
  SOLUTION_ARCHITECT = 'SOLUTION_ARCHITECT',
  AREA_LEAD = 'AREA_LEAD',
  PRODUCT_OWNER = 'PRODUCT_OWNER',
  PRODUCT_LEAD = 'PRODUCT_LEAD',
  SECURITY_CHAMPION = 'SECURITY_CHAMPION',
  SECURITY_ARCHITECT = 'SECURITY_ARCHITECT',
  TECHNICAL_ADVISER = 'TECHNICAL_ADVISER',
  TECHNICAL_TESTER = 'TECHNICAL_TESTER',
  UU_CHAMPION = 'UU_CHAMPION',
  MAINTENANCE_MANAGER = 'MAINTENANCE_MANAGER',
  STAFFING_MANAGER = 'STAFFING_MANAGER',
  DESIGN_RESEARCHER = 'DESIGN_RESEARCHER',
  HEAD_OF_LEGAL = 'HEAD_OF_LEGAL',
  PLATFORM_SYSTEM_TECHNICIAN = 'PLATFORM_SYSTEM_TECHNICIAN',
  TEAMCOACH = 'TEAMCOACH',
  OTHER = 'OTHER',
}

export enum TeamType {
  STREAM_ALIGNED = 'STREAM_ALIGNED',
  ENABLING = 'ENABLING',
  PLATFORM = 'PLATFORM',
  COMPLICATED_SUBSYSTEM = 'COMPLICATED_SUBSYSTEM',
  WORKGROUP = 'WORKGROUP',
  MANAGEMENT = 'MANAGEMENT',
  PROJECTGROUP = 'PROJECTGROUP',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

export enum ResourceType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  OTHER = 'OTHER',
}

export enum ProductAreaOwnerRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

export interface PageResponse<T> {
  pageNumber: number
  pageSize: number
  pages: number
  numberOfElements: number
  totalElements: number
  content: T[]
}

export interface ChangeStamp {
  lastModifiedBy: string
  lastModifiedDate: string
}

export interface UserInfo {
  loggedIn: boolean
  groups: string[]
  ident?: string
  name?: string
  givenName?: string
  familyName?: string
  email?: string
}

export interface ProductArea {
  id: string
  name: string
  areaType?: AreaType
  description: string
  slackChannel?: string
  status: Status
  tags: string[]
  members: Member[]
  locations: Location[]
  changeStamp?: ChangeStamp
  paOwnerGroup?: ProductAreaOwnerGroup
  defaultArea: boolean
}

export interface ProductAreaOwnerGroup {
  ownerResource: Resource
  ownerGroupMemberResourceList: Resource[]
}

export interface ProductAreaOwnerGroupFormValues {
  ownerNavId: string
  ownerGroupMemberNavIdList: string[]
}

export interface ProductAreaFormValues {
  id?: string
  name: string
  areaType: AreaType
  description: string
  slackChannel?: string
  status: Status
  tags: string[]
  members: MemberFormValues[]
  locations: Location[]
  ownerGroup?: ProductAreaOwnerGroupFormValues
}

export interface Cluster {
  id: string
  name: string
  slackChannel?: string
  status: Status
  description: string
  tags: string[]
  productAreaId?: string
  members: Member[]
  changeStamp?: ChangeStamp
}

export interface ClusterFormValues {
  id?: string
  name: string
  slackChannel?: string
  status: Status
  description: string
  productAreaId?: string
  tags: string[]
  members: MemberFormValues[]
}

export interface ProductTeam {
  id: string
  name: string
  description: string
  slackChannel?: string
  contactPersonIdent?: string
  contactPersonResource?: Resource
  productAreaId?: string
  clusterIds: string[]
  naisTeams: string[]
  members: Member[]
  qaTime?: string
  teamType: TeamType
  teamOwnershipType: TeamOwnershipType
  changeStamp: ChangeStamp
  tags: string[]
  locations: Location[]
  contactAddresses: ContactAddress[]
  status: Status
  teamOwnerIdent?: string
  teamOwnerResource?: Resource
  location?: LocationSimple
  officeHours?: OfficeHours
}

export interface ProductTeamFormValues {
  id?: string
  name: string
  description: string
  slackChannel?: string
  contactPersonIdent?: string
  contactPersonResource?: Resource
  productAreaId?: string
  clusterIds: string[]
  naisTeams: string[]
  members: MemberFormValues[]
  qaTime?: string
  teamType: TeamType
  teamOwnershipType: TeamOwnershipType
  tags: string[]
  locations: Location[]
  contactAddresses: ContactAddress[]
  status: Status
  teamOwnerIdent?: string
  teamOwnerResource?: Resource
  officeHours?: OfficeHoursFormValues
}

export interface OfficeHours {
  location: LocationSimple
  days?: string[]
  information?: string
}

export interface OfficeHoursFormValues {
  location?: LocationSimple
  locationCode?: string
  locationDisplayName?: string
  days?: string[]
  information?: string
  parent?: LocationSimple
}

export interface MemberFormValues {
  navIdent: string
  roles: TeamRole[]
  description?: string

  // Visual only, not for submit
  fullName?: string
  resourceType?: ResourceType
}

export interface Member {
  navIdent: string
  roles: TeamRole[]
  description?: string
  resource: Partial<Resource>
}

export interface Resource {
  navIdent: string
  email: string
  familyName: string
  fullName: string
  givenName: string
  startDate: string
  endDate?: string
  resourceType: ResourceType
  stale: boolean
}

export interface ResourceUnits {
  units: ResourceUnit[]
  members: Resource[]
}

export interface ResourceUnit {
  id: string
  orgNiv: string
  name: string
  niva?: string
  leader?: Resource
  parentUnit?: ResourceUnit
}

export interface NaisTeam {
  id: string
  name: string
  description: string
  slack: string
  members: { name: string; email: string }[]
  apps: { name: string; zone: string }[]
}

export interface Process {
  id: string
  name: string
  purposeCode: string
  purposeName: string
  purposeDescription: string
}

export interface Floor {
  id: string
  floorId: string
  name: string
  locationImageId: string
  dimY: number
  bubbleScale: number
}

export interface Location {
  floorId: string
  locationCode: string
  x: number
  y: number
}

export interface LocationSimple {
  code: string
  type: string
  description: string
  displayName: string
  parent?: LocationSimple
  subLocations?: LocationSimple[]
}

export interface LocationHierarchy extends LocationSimple {
  subLocations: LocationHierarchy[]
}

export interface ContactAddress {
  address: string
  type: AddressType
  slackUser?: SlackUser
  slackChannel?: SlackChannel
}

export interface SlackChannel {
  id: string
  name?: string
  numMembers?: number
}

export interface SlackUser {
  id: string
  name?: string
}

export enum AddressType {
  EPOST = 'EPOST',
  SLACK = 'SLACK',
  SLACK_USER = 'SLACK_USER',
}
