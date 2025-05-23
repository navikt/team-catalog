/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ContactAddress {
  address?: string;
  type?: "EPOST" | "SLACK" | "SLACK_USER";
}

export interface OfficeHours {
  locationCode?: string;
  days?: (
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"
  )[];
  information?: string;
}

export interface TeamMemberRequest {
  navIdent?: string;
  roles?: (
    | "LEAD"
    | "DEVELOPER"
    | "TESTER"
    | "TECH_DOMAIN_SPECIALIST"
    | "TECH_LEAD"
    | "TEST_LEAD"
    | "PRODUCT_OWNER"
    | "PRODUCT_LEAD"
    | "SECURITY_ARCHITECT"
    | "SOLUTION_ARCHITECT"
    | "BUSINESS_ANALYST"
    | "DOMAIN_EXPERT"
    | "DOMAIN_RESPONSIBLE"
    | "DOMAIN_RESOURCE"
    | "ARCHITECT"
    | "AGILE_COACH"
    | "DATA_MANAGER"
    | "DATA_SCIENTIST"
    | "MAINTENANCE_MANAGER"
    | "DESIGNER"
    | "DESIGN_LEAD"
    | "OPERATIONS"
    | "FUNCTIONAL_ADVISER"
    | "TECHNICAL_ADVISER"
    | "TECHNICAL_TESTER"
    | "COMMUNICATION_ADVISER"
    | "AREA_LEAD"
    | "LEGAL_ADVISER"
    | "SECURITY_CHAMPION"
    | "UU_CHAMPION"
    | "PROFIT_COACH"
    | "CONTROLLER"
    | "STAFFING_MANAGER"
    | "DESIGN_RESEARCHER"
    | "HEAD_OF_LEGAL"
    | "PRINCIPAL"
    | "PLATFORM_SYSTEM_TECHNICIAN"
    | "TEAMCOACH"
    | "WEB_ANALYST"
    | "UU_SPECIALIST"
    | "VISUAL_ANALYTICS_ENGINEER"
    | "DATA_ENGINEER"
    | "SUBJECT_MATTER_EXPERT"
    | "OTHER"
  )[];
  description?: string;
  /** @format int32 */
  teamPercent?: number;
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
}

export interface TeamRequest {
  id?: string;
  name?: string;
  description?: string;
  slackChannel?: string;
  contactPersonIdent?: string;
  contactAddresses?: ContactAddress[];
  productAreaId?: string;
  teamOwnerIdent?: string;
  clusterIds?: string[];
  teamType?:
    | "STREAM_ALIGNED"
    | "ENABLING"
    | "PLATFORM"
    | "COMPLICATED_SUBSYSTEM"
    | "WORKGROUP"
    | "MANAGEMENT"
    | "PROJECTGROUP"
    | "OTHER"
    | "UNKNOWN";
  teamOwnershipType?:
    | "PRODUCT"
    | "ADMINISTRATION"
    | "IT"
    | "PROJECT"
    | "OTHER"
    | "UNKNOWN";
  /** @format date-time */
  qaTime?: string;
  naisTeams?: string[];
  members?: TeamMemberRequest[];
  tags?: string[];
  officeHours?: OfficeHours;
  status?: "ACTIVE" | "PLANNED" | "INACTIVE";
}

export interface ChangeStampResponse {
  lastModifiedBy?: string;
  /** @format date-time */
  lastModifiedDate?: string;
}

export interface Links {
  ui?: string;
  slackChannels?: NamedLink[];
}

export interface LocationSimplePathResponse {
  code?: string;
  type?: "BUILDING" | "SECTION" | "FLOOR";
  description?: string;
  displayName?: string;
  parent?: any;
}

export interface MemberResponse {
  navIdent?: string;
  description?: string;
  roles?: (
    | "LEAD"
    | "DEVELOPER"
    | "TESTER"
    | "TECH_DOMAIN_SPECIALIST"
    | "TECH_LEAD"
    | "TEST_LEAD"
    | "PRODUCT_OWNER"
    | "PRODUCT_LEAD"
    | "SECURITY_ARCHITECT"
    | "SOLUTION_ARCHITECT"
    | "BUSINESS_ANALYST"
    | "DOMAIN_EXPERT"
    | "DOMAIN_RESPONSIBLE"
    | "DOMAIN_RESOURCE"
    | "ARCHITECT"
    | "AGILE_COACH"
    | "DATA_MANAGER"
    | "DATA_SCIENTIST"
    | "MAINTENANCE_MANAGER"
    | "DESIGNER"
    | "DESIGN_LEAD"
    | "OPERATIONS"
    | "FUNCTIONAL_ADVISER"
    | "TECHNICAL_ADVISER"
    | "TECHNICAL_TESTER"
    | "COMMUNICATION_ADVISER"
    | "AREA_LEAD"
    | "LEGAL_ADVISER"
    | "SECURITY_CHAMPION"
    | "UU_CHAMPION"
    | "PROFIT_COACH"
    | "CONTROLLER"
    | "STAFFING_MANAGER"
    | "DESIGN_RESEARCHER"
    | "HEAD_OF_LEGAL"
    | "PRINCIPAL"
    | "PLATFORM_SYSTEM_TECHNICIAN"
    | "TEAMCOACH"
    | "WEB_ANALYST"
    | "UU_SPECIALIST"
    | "VISUAL_ANALYTICS_ENGINEER"
    | "DATA_ENGINEER"
    | "SUBJECT_MATTER_EXPERT"
    | "OTHER"
  )[];
  /** @format int32 */
  teamPercent?: number;
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
  resource?: ResourceResponse;
}

export interface NamedLink {
  name?: string;
  url?: string;
}

export interface OfficeHoursResponse {
  location?: LocationSimplePathResponse;
  days?: (
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"
  )[];
  information?: string;
}

export interface ResourceResponse {
  navIdent?: string;
  givenName?: string;
  familyName?: string;
  fullName?: string;
  email?: string;
  onLeave?: boolean;
  resourceType?: "INTERNAL" | "EXTERNAL" | "OTHER";
  /** @format date */
  startDate?: string;
  /** @format date */
  endDate?: string;
  stale?: boolean;
  links?: Links;
}

export interface TeamResponse {
  /** @format uuid */
  id?: string;
  name?: string;
  description?: string;
  slackChannel?: string;
  contactPersonIdent?: string;
  /** @format uuid */
  productAreaId?: string;
  teamOwnerIdent?: string;
  clusterIds?: string[];
  teamType?:
    | "STREAM_ALIGNED"
    | "ENABLING"
    | "PLATFORM"
    | "COMPLICATED_SUBSYSTEM"
    | "WORKGROUP"
    | "MANAGEMENT"
    | "PROJECTGROUP"
    | "OTHER"
    | "UNKNOWN";
  teamOwnershipType?:
    | "PRODUCT"
    | "ADMINISTRATION"
    | "IT"
    | "PROJECT"
    | "OTHER"
    | "UNKNOWN";
  /** @format date-time */
  qaTime?: string;
  naisTeams?: string[];
  members?: MemberResponse[];
  tags?: string[];
  officeHours?: OfficeHoursResponse;
  status?: "ACTIVE" | "PLANNED" | "INACTIVE";
  changeStamp?: ChangeStampResponse;
  links?: Links;
  contactAddresses?: ContactAddress[];
}

export interface PaMemberRequest {
  navIdent?: string;
  roles?: (
    | "LEAD"
    | "DEVELOPER"
    | "TESTER"
    | "TECH_DOMAIN_SPECIALIST"
    | "TECH_LEAD"
    | "TEST_LEAD"
    | "PRODUCT_OWNER"
    | "PRODUCT_LEAD"
    | "SECURITY_ARCHITECT"
    | "SOLUTION_ARCHITECT"
    | "BUSINESS_ANALYST"
    | "DOMAIN_EXPERT"
    | "DOMAIN_RESPONSIBLE"
    | "DOMAIN_RESOURCE"
    | "ARCHITECT"
    | "AGILE_COACH"
    | "DATA_MANAGER"
    | "DATA_SCIENTIST"
    | "MAINTENANCE_MANAGER"
    | "DESIGNER"
    | "DESIGN_LEAD"
    | "OPERATIONS"
    | "FUNCTIONAL_ADVISER"
    | "TECHNICAL_ADVISER"
    | "TECHNICAL_TESTER"
    | "COMMUNICATION_ADVISER"
    | "AREA_LEAD"
    | "LEGAL_ADVISER"
    | "SECURITY_CHAMPION"
    | "UU_CHAMPION"
    | "PROFIT_COACH"
    | "CONTROLLER"
    | "STAFFING_MANAGER"
    | "DESIGN_RESEARCHER"
    | "HEAD_OF_LEGAL"
    | "PRINCIPAL"
    | "PLATFORM_SYSTEM_TECHNICIAN"
    | "TEAMCOACH"
    | "WEB_ANALYST"
    | "UU_SPECIALIST"
    | "VISUAL_ANALYTICS_ENGINEER"
    | "DATA_ENGINEER"
    | "SUBJECT_MATTER_EXPERT"
    | "OTHER"
  )[];
  description?: string;
}

export interface PaOwnerGroupRequest {
  ownerNavId?: string;
  ownerGroupMemberNavIdList?: string[];
}

export interface ProductAreaRequest {
  id?: string;
  name?: string;
  nomId?: string;
  areaType?: "PRODUCT_AREA" | "IT" | "PROJECT" | "OTHER";
  description?: string;
  slackChannel?: string;
  tags?: string[];
  members?: PaMemberRequest[];
  ownerGroup?: PaOwnerGroupRequest;
  status?: "ACTIVE" | "PLANNED" | "INACTIVE";
}

export interface PaOwnerGroupResponse {
  ownerResource?: ResourceResponse;
  ownerGroupMemberResourceList?: ResourceResponse[];
}

export interface ProductAreaResponse {
  /** @format uuid */
  id?: string;
  name?: string;
  avdelingNomId?: string;
  nomId?: string;
  areaType?: "PRODUCT_AREA" | "IT" | "PROJECT" | "OTHER";
  description?: string;
  slackChannel?: string;
  tags?: string[];
  members?: MemberResponse[];
  status?: "ACTIVE" | "PLANNED" | "INACTIVE";
  changeStamp?: ChangeStampResponse;
  links?: Links;
  paOwnerGroup?: PaOwnerGroupResponse;
  defaultArea?: boolean;
}

export interface ClusterMemberRequest {
  navIdent?: string;
  roles?: (
    | "LEAD"
    | "DEVELOPER"
    | "TESTER"
    | "TECH_DOMAIN_SPECIALIST"
    | "TECH_LEAD"
    | "TEST_LEAD"
    | "PRODUCT_OWNER"
    | "PRODUCT_LEAD"
    | "SECURITY_ARCHITECT"
    | "SOLUTION_ARCHITECT"
    | "BUSINESS_ANALYST"
    | "DOMAIN_EXPERT"
    | "DOMAIN_RESPONSIBLE"
    | "DOMAIN_RESOURCE"
    | "ARCHITECT"
    | "AGILE_COACH"
    | "DATA_MANAGER"
    | "DATA_SCIENTIST"
    | "MAINTENANCE_MANAGER"
    | "DESIGNER"
    | "DESIGN_LEAD"
    | "OPERATIONS"
    | "FUNCTIONAL_ADVISER"
    | "TECHNICAL_ADVISER"
    | "TECHNICAL_TESTER"
    | "COMMUNICATION_ADVISER"
    | "AREA_LEAD"
    | "LEGAL_ADVISER"
    | "SECURITY_CHAMPION"
    | "UU_CHAMPION"
    | "PROFIT_COACH"
    | "CONTROLLER"
    | "STAFFING_MANAGER"
    | "DESIGN_RESEARCHER"
    | "HEAD_OF_LEGAL"
    | "PRINCIPAL"
    | "PLATFORM_SYSTEM_TECHNICIAN"
    | "TEAMCOACH"
    | "WEB_ANALYST"
    | "UU_SPECIALIST"
    | "VISUAL_ANALYTICS_ENGINEER"
    | "DATA_ENGINEER"
    | "SUBJECT_MATTER_EXPERT"
    | "OTHER"
  )[];
  description?: string;
}

export interface ClusterRequest {
  id?: string;
  name?: string;
  description?: string;
  slackChannel?: string;
  tags?: string[];
  productAreaId?: string;
  members?: ClusterMemberRequest[];
  status?: "ACTIVE" | "PLANNED" | "INACTIVE";
}

export interface ClusterResponse {
  /** @format uuid */
  id?: string;
  name?: string;
  description?: string;
  slackChannel?: string;
  tags?: string[];
  /** @format uuid */
  productAreaId?: string;
  members?: MemberResponse[];
  status?: "ACTIVE" | "PLANNED" | "INACTIVE";
  changeStamp?: ChangeStampResponse;
  links?: Links;
}

export interface RestResponsePageTeamResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: TeamResponse[];
}

export interface Settings {
  frontpageMessage?: string;
  identFilter?: string[];
}

export interface RestResponsePageResourceResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: ResourceResponse[];
}

export interface AddTeamsToProductAreaRequest {
  productAreaId?: string;
  teamIds?: string[];
}

export interface FolkeregisterPersonDto {
  navn: NavnDto;
}

export interface KodeDto {
  kode: string;
  navn: string;
  /** @format date */
  gyldigFom?: string;
  /** @format date */
  gyldigTom?: string;
}

export interface LederOrgEnhetDto {
  organisasjonsenhet: any;
  orgEnhet: OrgEnhetDto;
  /** @format date */
  gyldigFom: string;
  /** @format date */
  gyldigTom?: string;
}

export interface NavnDto {
  fornavn: string;
  mellomnavn?: string;
  etternavn: string;
}

export interface OrgEnhetDto {
  id: string;
  agressoId: string;
  orgNiv: string;
  agressoOrgenhetType?: string;
  navn: string;
  /** @format date */
  gyldigFom: string;
  /** @format date */
  gyldigTom?: string;
  organiseringer: OrganiseringDto[];
  leder: OrgEnhetsLederDto[];
  koblinger: OrgEnhetsKoblingDto[];
  /** @deprecated */
  orgEnhetsKategori?: "LINJEENHET" | "DRIFTSENHET" | "ARBEIDSOMRAADE";
  nomNivaa?: "LINJEENHET" | "DRIFTSENHET" | "ARBEIDSOMRAADE";
  /** @deprecated */
  type?: KodeDto;
  orgEnhetsType?:
    | "ARBEIDSLIVSSENTER"
    | "NAV_ARBEID_OG_YTELSER"
    | "ARBEIDSRAADGIVNING"
    | "DIREKTORAT"
    | "DIR"
    | "FYLKE"
    | "NAV_FAMILIE_OG_PENSJONSYTELSER"
    | "HJELPEMIDLER_OG_TILRETTELEGGING"
    | "KLAGEINSTANS"
    | "NAV_KONTAKTSENTER"
    | "KONTROLL_KONTROLLENHET"
    | "NAV_KONTOR"
    | "TILTAK"
    | "NAV_OKONOMITJENESTE";
  remedyEnhetId?: string;
}

export interface OrgEnhetsKoblingDto {
  ressurs: any;
  /** @format date */
  gyldigFom: string;
  /** @format date */
  gyldigTom?: string;
}

export interface OrgEnhetsLederDto {
  ressurs: RessursDto;
}

export interface OrganiseringDto {
  retning: "over" | "under";
  /** @deprecated */
  organisasjonsenhet: OrgEnhetDto;
  orgEnhet: OrgEnhetDto;
  /** @format date */
  gyldigFom: string;
  /** @format date */
  gyldigTom?: string;
}

export interface RessursDto {
  /** @deprecated */
  navIdent: string;
  navident: string;
  /** @deprecated */
  personIdent: string;
  personident: string;
  /** @deprecated */
  koblinger: RessursOrgTilknytningDto[];
  orgTilknytning: RessursOrgTilknytningDto[];
  lederFor: LederOrgEnhetDto[];
  ledere: RessursLederDto[];
  /** @deprecated */
  person?: FolkeregisterPersonDto;
  folkeregisterPerson?: FolkeregisterPersonDto;
  epost?: string;
  /** @deprecated */
  visningsNavn?: string;
  visningsnavn?: string;
  fornavn?: string;
  etternavn?: string;
  primaryTelefon?: string;
  telefon: TelefonDto[];
  /** @deprecated */
  ressurstype: ("NAV_STATLIG" | "NAV_KOMMUNAL" | "EKSTERN")[];
  sektor: ("NAV_STATLIG" | "NAV_KOMMUNAL" | "EKSTERN")[];
  /**
   * @deprecated
   * @format date
   */
  sluttdato?: string;
  /** @format date */
  startdato?: string;
}

export interface RessursLederDto {
  erDagligOppfolging?: boolean;
  ressurs: any;
  /** @format date */
  gyldigFom: string;
  /** @format date */
  gyldigTom?: string;
}

export interface RessursOrgTilknytningDto {
  organisasjonsenhet: any;
  orgEnhet: OrgEnhetDto;
  erDagligOppfolging?: boolean;
  /** @format date */
  gyldigFom: string;
  /** @format date */
  gyldigTom?: string;
  tilknytningType?:
    | "ANNET"
    | "ARBEIDSTRENING"
    | "EKSTERN_SAMARBEIDSPARTNER"
    | "FAST"
    | "INGEN"
    | "JOBBSPESIALIST"
    | "KONSULENT"
    | "LAERLING"
    | "MIDLERTIDIG"
    | "PENSJONIST"
    | "PRAKSISARBEID"
    | "STUDENT"
    | "UFORUTSETT_BEHOV"
    | "UTDANNINGSSTILLINGER"
    | "VIKAR";
}

export interface TelefonDto {
  nummer: string;
  type: "NAV_TJENESTE_TELEFON" | "NAV_KONTOR_TELEFON" | "PRIVAT_TELEFON";
  beskrivelse?: string;
}

export interface NotificationDto {
  /** @format uuid */
  id?: string;
  ident?: string;
  /** @format uuid */
  target?: string;
  type?: "TEAM" | "PA" | "ALL_EVENTS";
  time?: "ALL" | "DAILY" | "WEEKLY" | "MONTHLY";
  channels?: ("EMAIL" | "SLACK")[];
}

export interface LogRequest {
  level?: "info" | "warn" | "error";
  context?: string;
  content?: string;
}

export interface UserInfoResponse {
  loggedIn?: boolean;
  ident?: string;
  name?: string;
  email?: string;
  groups?: string[];
}

export interface RestResponsePageString {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: string[];
}

export interface ResourceUnitsResponse {
  units?: Unit[];
  members?: ResourceResponse[];
}

export interface Unit {
  id?: string;
  nomid?: string;
  name?: string;
  niva?: string;
  leader?: ResourceResponse;
  parentUnit?: Unit;
}

export interface RestResponsePageProductAreaResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: ProductAreaResponse[];
}

export interface RestResponsePageNotificationDto {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: NotificationDto[];
}

export type Changeable = any;

export interface Changelog {
  created?: Item[];
  deleted?: Item[];
  updated?: Changeable[];
}

export interface Item {
  type?: "TEAM" | "AREA";
  id?: string;
  name?: string;
  deleted?: boolean;
}

export interface RestResponsePageChangelog {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: Changelog[];
}

export interface NaisTeam {
  slackChannel?: string;
  purpose?: string;
  slug?: string;
}

export interface RestResponsePageNaisTeam {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: NaisTeam[];
}

export interface MembershipResponse {
  teams?: TeamResponse[];
  productAreas?: ProductAreaResponse[];
  clusters?: ClusterResponse[];
}

export interface LocationResponse {
  code?: string;
  description?: string;
  displayName?: string;
  type?: "BUILDING" | "SECTION" | "FLOOR";
  subLocations?: LocationResponse[];
}

export interface LocationSimpleResponse {
  code?: string;
  type?: "BUILDING" | "SECTION" | "FLOOR";
  description?: string;
  displayName?: string;
}

export interface ProcessResponse {
  id?: string;
  name?: string;
  purposeCode?: string;
  purposeName?: string;
  purposeDescription?: string;
}

export interface RestResponsePageProcessResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: ProcessResponse[];
}

export interface AreaSummary {
  /** @format int64 */
  membershipCount?: number;
  /** @format int64 */
  uniqueResourcesCount?: number;
  /** @format int64 */
  teamCount?: number;
  /** @format int64 */
  totalTeamCount?: number;
  /** @format int64 */
  totalUniqueTeamCount?: number;
  /** @format int64 */
  clusterCount?: number;
  /** @format int64 */
  uniqueResourcesExternal?: number;
}

export interface ClusterSummary {
  /** @format int64 */
  totalMembershipCount?: number;
  /** @format int64 */
  totalUniqueResourcesCount?: number;
  /** @format int64 */
  uniqueResourcesExternal?: number;
  /** @format int64 */
  teamCount?: number;
}

export interface DashResponse {
  /** @format int64 */
  teamsCount?: number;
  /** @format int64 */
  productAreasCount?: number;
  /** @format int64 */
  clusterCount?: number;
  /** @format int64 */
  resources?: number;
  /** @format int64 */
  resourcesDb?: number;
  /** @format int64 */
  teamsCountPlanned?: number;
  /** @format int64 */
  teamsCountInactive?: number;
  /** @format int64 */
  productAreasCountPlanned?: number;
  /** @format int64 */
  productAreasCountInactive?: number;
  /** @format int64 */
  clusterCountPlanned?: number;
  /** @format int64 */
  clusterCountInactive?: number;
  total?: TeamSummary;
  productAreas?: TeamSummary[];
  clusters?: TeamSummary[];
  areaSummaryMap?: Record<string, AreaSummary>;
  clusterSummaryMap?: Record<string, ClusterSummary>;
  teamSummaryMap?: Record<string, TeamSummary2>;
  locationSummaryMap?: Record<string, LocationSummary>;
}

export interface LocationDaySummary {
  /** @format int64 */
  teamCount?: number;
  /** @format int64 */
  resourceCount?: number;
}

export interface LocationSummary {
  /** @format int64 */
  teamCount?: number;
  /** @format int64 */
  resourceCount?: number;
  monday: LocationDaySummary;
  tuesday: LocationDaySummary;
  wednesday: LocationDaySummary;
  thursday: LocationDaySummary;
  friday: LocationDaySummary;
}

export interface RoleCount {
  role?:
    | "LEAD"
    | "DEVELOPER"
    | "TESTER"
    | "TECH_DOMAIN_SPECIALIST"
    | "TECH_LEAD"
    | "TEST_LEAD"
    | "PRODUCT_OWNER"
    | "PRODUCT_LEAD"
    | "SECURITY_ARCHITECT"
    | "SOLUTION_ARCHITECT"
    | "BUSINESS_ANALYST"
    | "DOMAIN_EXPERT"
    | "DOMAIN_RESPONSIBLE"
    | "DOMAIN_RESOURCE"
    | "ARCHITECT"
    | "AGILE_COACH"
    | "DATA_MANAGER"
    | "DATA_SCIENTIST"
    | "MAINTENANCE_MANAGER"
    | "DESIGNER"
    | "DESIGN_LEAD"
    | "OPERATIONS"
    | "FUNCTIONAL_ADVISER"
    | "TECHNICAL_ADVISER"
    | "TECHNICAL_TESTER"
    | "COMMUNICATION_ADVISER"
    | "AREA_LEAD"
    | "LEGAL_ADVISER"
    | "SECURITY_CHAMPION"
    | "UU_CHAMPION"
    | "PROFIT_COACH"
    | "CONTROLLER"
    | "STAFFING_MANAGER"
    | "DESIGN_RESEARCHER"
    | "HEAD_OF_LEGAL"
    | "PRINCIPAL"
    | "PLATFORM_SYSTEM_TECHNICIAN"
    | "TEAMCOACH"
    | "WEB_ANALYST"
    | "UU_SPECIALIST"
    | "VISUAL_ANALYTICS_ENGINEER"
    | "DATA_ENGINEER"
    | "SUBJECT_MATTER_EXPERT"
    | "OTHER";
  /** @format int64 */
  count?: number;
}

export interface TeamOwnershipTypeCount {
  type?: "PRODUCT" | "ADMINISTRATION" | "IT" | "PROJECT" | "OTHER" | "UNKNOWN";
  /** @format int64 */
  count?: number;
}

export interface TeamSummary {
  /** @format uuid */
  productAreaId?: string;
  /** @format uuid */
  clusterId?: string;
  /** @format int64 */
  clusters?: number;
  /** @format int64 */
  teams?: number;
  /** @format int64 */
  teamsEditedLastWeek?: number;
  /** @format int64 */
  teamEmpty?: number;
  /** @format int64 */
  teamUpTo5?: number;
  /** @format int64 */
  teamUpTo10?: number;
  /** @format int64 */
  teamUpTo20?: number;
  /** @format int64 */
  teamOver20?: number;
  /** @format int64 */
  teamExternal0p?: number;
  /** @format int64 */
  teamExternalUpto25p?: number;
  /** @format int64 */
  teamExternalUpto50p?: number;
  /** @format int64 */
  teamExternalUpto75p?: number;
  /** @format int64 */
  teamExternalUpto100p?: number;
  /** @format int64 */
  uniqueResources?: number;
  /** @format int64 */
  uniqueResourcesExternal?: number;
  /** @format int64 */
  totalResources?: number;
  roles?: RoleCount[];
  teamOwnershipTypes?: TeamOwnershipTypeCount[];
  teamTypes?: TeamTypeCount[];
}

export interface TeamSummary2 {
  /** @format int64 */
  membershipCount?: number;
  /** @format int64 */
  resourcesExternal?: number;
}

export interface TeamTypeCount {
  type?:
    | "STREAM_ALIGNED"
    | "ENABLING"
    | "PLATFORM"
    | "COMPLICATED_SUBSYSTEM"
    | "WORKGROUP"
    | "MANAGEMENT"
    | "PROJECTGROUP"
    | "OTHER"
    | "UNKNOWN";
  /** @format int64 */
  count?: number;
}

export interface ContactAddressResponse {
  address?: string;
  type?: "EPOST" | "SLACK" | "SLACK_USER";
  slackChannel?: SlackChannel;
  slackUser?: SlackUser;
}

export interface RestResponsePageContactAddressResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: ContactAddressResponse[];
}

export interface SlackChannel {
  id?: string;
  name?: string;
  /** @format int32 */
  numMembers?: number;
}

export interface SlackUser {
  id?: string;
  name?: string;
}

export interface RestResponsePageSlackChannel {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: SlackChannel[];
}

export interface RestResponsePageClusterResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: ClusterResponse[];
}

export interface AuditResponse {
  id?: string;
  action?: "CREATE" | "UPDATE" | "DELETE";
  table?: string;
  tableId?: string;
  /** @format date-time */
  time?: string;
  user?: string;
  data?: JsonNode;
}

export type JsonNode = any;

export interface RestResponsePageAuditResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: AuditResponse[];
}

export interface MailLogResponse {
  /** @format uuid */
  id?: string;
  /** @format date-time */
  time?: string;
  to?: string;
  subject?: string;
  body?: string;
  channel?: "EPOST" | "SLACK" | "SLACK_USER";
}

export interface RestResponsePageMailLogResponse {
  /** @format int64 */
  pageNumber?: number;
  /** @format int64 */
  pageSize?: number;
  /** @format int64 */
  pages?: number;
  /** @format int64 */
  numberOfElements?: number;
  /** @format int64 */
  totalElements?: number;
  paged?: boolean;
  content?: MailLogResponse[];
}

export interface AuditLogResponse {
  id?: string;
  audits?: AuditResponse[];
}
