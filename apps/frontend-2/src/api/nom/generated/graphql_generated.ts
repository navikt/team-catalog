import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** An RFC-3339 compliant Full Date Scalar */
  Date: any;
  /** An ISO-8601 compliant DateTime Scalar */
  DateTime: any;
  /** A JSON scalar */
  JSON: any;
};

export type Kode = {
  __typename?: 'Kode';
  gyldigFom?: Maybe<Scalars['Date']>;
  gyldigTom?: Maybe<Scalars['Date']>;
  kode: Scalars['String'];
  navn: Scalars['String'];
};

export type LederOrganisasjonsenhet = {
  __typename?: 'LederOrganisasjonsenhet';
  organisasjonsenhet: Organisasjonsenhet;
};

export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Ordre
   *    removeRequestFromOrdre(ordreId: ID!, ordreLinjeId: ID!): ResultCode!
   *    editOrdre(ordreId: ID!, metadata: EditOrdreRequest!): ResultCode!
   */
  godkjennOrdre: ResultCode;
  opprettEnhet: OrdreLinjeResponse;
  opprettRessurs?: Maybe<OpprettRessursResponse>;
  /** OrdreLinje */
  ordreRessurs: OrdreLinjeResponse;
};


export type MutationGodkjennOrdreArgs = {
  ordreId: Scalars['ID'];
};


export type MutationOpprettEnhetArgs = {
  request: OpprettEnhetRequest;
};


export type MutationOpprettRessursArgs = {
  forbokstav?: InputMaybe<Scalars['String']>;
  personIdent: Scalars['String'];
};


export type MutationOrdreRessursArgs = {
  request: OpprettRessursRequest;
};

export type Navn = {
  __typename?: 'Navn';
  etternavn: Scalars['String'];
  fornavn: Scalars['String'];
  mellomnavn?: Maybe<Scalars['String']>;
};

export type OpprettEnhetRequest = {
  agressoId?: InputMaybe<Scalars['String']>;
  metadata: OrdreLinjeRequestMetadata;
  navn: Scalars['String'];
};

export type OpprettRessursRequest = {
  metadata: OrdreLinjeRequestMetadata;
  personIdent: Scalars['String'];
  visningsnavn?: InputMaybe<Scalars['String']>;
};

export type OpprettRessursResponse = {
  __typename?: 'OpprettRessursResponse';
  navIdent: Scalars['String'];
  nomId: Scalars['String'];
  person?: Maybe<Person>;
  personIdent: Scalars['String'];
};

export type Ordre = {
  __typename?: 'Ordre';
  beskrivelse?: Maybe<Scalars['String']>;
  endretTidspunkt: Scalars['DateTime'];
  ordreId: Scalars['ID'];
  ordreLinjer: Array<OrdreLinje>;
};

export type OrdreLinje = {
  __typename?: 'OrdreLinje';
  /** define explicitly? */
  data?: Maybe<Scalars['JSON']>;
  metadata?: Maybe<OrdreLinjeMetadata>;
  ordreId: Scalars['ID'];
  ordreLinjeId: Scalars['ID'];
  type?: Maybe<OrdreLinjeType>;
};

export type OrdreLinjeMetadata = {
  __typename?: 'OrdreLinjeMetadata';
  beskrivelse?: Maybe<Scalars['String']>;
  ordreId: Scalars['ID'];
};

/** Requests */
export type OrdreLinjeRequestMetadata = {
  beskrivelse?: InputMaybe<Scalars['String']>;
  /** Request set/Endringspakke, valgfri, bruk for å legge til eksisterende pakke */
  ordreId?: InputMaybe<Scalars['ID']>;
};

/** Responses */
export type OrdreLinjeResponse = {
  __typename?: 'OrdreLinjeResponse';
  ordreLinje: OrdreLinje;
};

export enum OrdreLinjeType {
  OpprettEnhet = 'OPPRETT_ENHET',
  OpprettRessurs = 'OPPRETT_RESSURS'
}

export type Organisasjonsenhet = {
  __typename?: 'Organisasjonsenhet';
  agressoId: Scalars['ID'];
  gyldigFom: Scalars['Date'];
  gyldigTom?: Maybe<Scalars['Date']>;
  koblinger: Array<OrganisasjonsenhetsKobling>;
  leder: Array<OrganisasjonsenhetsLeder>;
  navn: Scalars['String'];
  orgNiv: Scalars['String'];
  organiseringer: Array<Organisering>;
  type?: Maybe<Kode>;
};


export type OrganisasjonsenhetOrganiseringerArgs = {
  retning?: InputMaybe<Retning>;
};

export type OrganisasjonsenhetResult = {
  __typename?: 'OrganisasjonsenhetResult';
  code: ResultCode;
  id: Scalars['String'];
  orgNiv?: Maybe<Scalars['String']>;
  organisasjonsenhet?: Maybe<Organisasjonsenhet>;
};

export type OrganisasjonsenhetSearch = {
  agressoId?: InputMaybe<Scalars['String']>;
  orgNiv?: InputMaybe<Scalars['String']>;
};

export type OrganisasjonsenheterSearch = {
  agressoIder?: InputMaybe<Array<Scalars['String']>>;
  orgNiv?: InputMaybe<Scalars['String']>;
};

export type OrganisasjonsenhetsKobling = {
  __typename?: 'OrganisasjonsenhetsKobling';
  gyldigFom: Scalars['Date'];
  gyldigTom?: Maybe<Scalars['Date']>;
  ressurs: Ressurs;
};

export type OrganisasjonsenhetsLeder = {
  __typename?: 'OrganisasjonsenhetsLeder';
  ressurs: Ressurs;
};

export type Organisering = {
  __typename?: 'Organisering';
  gyldigFom: Scalars['Date'];
  gyldigTom?: Maybe<Scalars['Date']>;
  organisasjonsenhet: Organisasjonsenhet;
  retning: Retning;
};

export type Person = {
  __typename?: 'Person';
  navn: Navn;
};

export type PersonResult = {
  __typename?: 'PersonResult';
  navIdent?: Maybe<Scalars['String']>;
  nomId?: Maybe<Scalars['String']>;
  person?: Maybe<Person>;
  personIdent: Scalars['String'];
};

export type PersonSearch = {
  personIdent: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  ordre?: Maybe<Ordre>;
  ordreBulk: Array<Ordre>;
  organisasjonsenhet?: Maybe<Organisasjonsenhet>;
  organisasjonsenheter: Array<OrganisasjonsenhetResult>;
  person?: Maybe<PersonResult>;
  ressurs?: Maybe<Ressurs>;
  ressurser: Array<RessursResult>;
  search: Array<SearchResult>;
};


export type QueryOrdreArgs = {
  ordreId: Scalars['ID'];
};


export type QueryOrdreBulkArgs = {
  ordreId?: InputMaybe<Array<Scalars['ID']>>;
};


export type QueryOrganisasjonsenhetArgs = {
  where?: InputMaybe<OrganisasjonsenhetSearch>;
};


export type QueryOrganisasjonsenheterArgs = {
  where?: InputMaybe<OrganisasjonsenheterSearch>;
};


export type QueryPersonArgs = {
  where?: InputMaybe<PersonSearch>;
};


export type QueryRessursArgs = {
  where?: InputMaybe<RessursSearch>;
};


export type QueryRessurserArgs = {
  where?: InputMaybe<RessurserSearch>;
};


export type QuerySearchArgs = {
  term: Scalars['String'];
};

export type Ressurs = {
  __typename?: 'Ressurs';
  epost?: Maybe<Scalars['String']>;
  etternavn?: Maybe<Scalars['String']>;
  fornavn?: Maybe<Scalars['String']>;
  koblinger: Array<RessursKobling>;
  lederFor: Array<LederOrganisasjonsenhet>;
  ledere: Array<RessursLeder>;
  navIdent: Scalars['String'];
  nomId: Scalars['String'];
  person?: Maybe<Person>;
  personIdent: Scalars['String'];
  telefon: Array<Telefon>;
  visningsNavn?: Maybe<Scalars['String']>;
};

export type RessursKobling = {
  __typename?: 'RessursKobling';
  gyldigFom: Scalars['Date'];
  gyldigTom?: Maybe<Scalars['Date']>;
  organisasjonsenhet: Organisasjonsenhet;
};

export type RessursLeder = {
  __typename?: 'RessursLeder';
  ressurs: Ressurs;
};

export type RessursResult = {
  __typename?: 'RessursResult';
  code: ResultCode;
  id: Scalars['String'];
  ressurs?: Maybe<Ressurs>;
};

export type RessursSearch = {
  navIdent?: InputMaybe<Scalars['String']>;
  personIdent?: InputMaybe<Scalars['String']>;
};

export type RessurserSearch = {
  navIdenter?: InputMaybe<Array<Scalars['String']>>;
  personIdenter?: InputMaybe<Array<Scalars['String']>>;
};

export enum ResultCode {
  Error = 'ERROR',
  NotFound = 'NOT_FOUND',
  Ok = 'OK'
}

export enum Retning {
  Over = 'over',
  Under = 'under'
}

export type SearchResult = Organisasjonsenhet | Ressurs;

export type Telefon = {
  __typename?: 'Telefon';
  beskrivelse?: Maybe<Scalars['String']>;
  nummer: Scalars['String'];
  type: TelefonType;
};

export enum TelefonType {
  NavKontorTelefon = 'NAV_KONTOR_TELEFON',
  NavTjenesteTelefon = 'NAV_TJENESTE_TELEFON',
  PrivatTelefon = 'PRIVAT_TELEFON'
}

export type HentOrganiasjonsEnheterMedHierarkiQueryVariables = Exact<{
  aid?: InputMaybe<Scalars['String']>;
  oniv?: InputMaybe<Scalars['String']>;
}>;


export type HentOrganiasjonsEnheterMedHierarkiQuery = { __typename?: 'Query', organisasjonsenhet?: { __typename?: 'Organisasjonsenhet', agressoId: string, orgNiv: string, navn: string, gyldigFom: any, gyldigTom?: any | null, underenheter: Array<{ __typename?: 'Organisering', organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string, type?: { __typename?: 'Kode', kode: string, navn: string } | null } }>, overenheter: Array<{ __typename?: 'Organisering', retning: Retning, organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string, organiseringer: Array<{ __typename?: 'Organisering', retning: Retning, organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string, organiseringer: Array<{ __typename?: 'Organisering', retning: Retning, organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string, organiseringer: Array<{ __typename?: 'Organisering', retning: Retning, organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string, organiseringer: Array<{ __typename?: 'Organisering', retning: Retning, organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string, organiseringer: Array<{ __typename?: 'Organisering', retning: Retning, organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string, organiseringer: Array<{ __typename?: 'Organisering', retning: Retning, organisasjonsenhet: { __typename?: 'Organisasjonsenhet', navn: string, agressoId: string, orgNiv: string } }> } }> } }> } }> } }> } }> } }>, leder: Array<{ __typename?: 'OrganisasjonsenhetsLeder', ressurs: { __typename?: 'Ressurs', navIdent: string, personIdent: string, person?: { __typename?: 'Person', navn: { __typename?: 'Navn', fornavn: string, mellomnavn?: string | null, etternavn: string } } | null } }>, koblinger: Array<{ __typename?: 'OrganisasjonsenhetsKobling', ressurs: { __typename?: 'Ressurs', navIdent: string, personIdent: string, person?: { __typename?: 'Person', navn: { __typename?: 'Navn', fornavn: string, mellomnavn?: string | null, etternavn: string } } | null } }>, type?: { __typename?: 'Kode', kode: string, navn: string } | null } | null };

export type HentRessursQueryVariables = Exact<{
  navIdent?: InputMaybe<Scalars['String']>;
}>;


export type HentRessursQuery = { __typename?: 'Query', ressurs?: { __typename?: 'Ressurs', fornavn?: string | null, etternavn?: string | null } | null };

export type HentAlleOrganisasjonsenheterQueryVariables = Exact<{ [key: string]: never; }>;


export type HentAlleOrganisasjonsenheterQuery = { __typename?: 'Query', organisasjonsenheter: Array<{ __typename?: 'OrganisasjonsenhetResult', id: string, orgNiv?: string | null, code: ResultCode, organisasjonsenhet?: { __typename?: 'Organisasjonsenhet', orgNiv: string, agressoId: string, navn: string } | null }> };



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Kode: ResolverTypeWrapper<Kode>;
  LederOrganisasjonsenhet: ResolverTypeWrapper<LederOrganisasjonsenhet>;
  Mutation: ResolverTypeWrapper<{}>;
  Navn: ResolverTypeWrapper<Navn>;
  OpprettEnhetRequest: OpprettEnhetRequest;
  OpprettRessursRequest: OpprettRessursRequest;
  OpprettRessursResponse: ResolverTypeWrapper<OpprettRessursResponse>;
  Ordre: ResolverTypeWrapper<Ordre>;
  OrdreLinje: ResolverTypeWrapper<OrdreLinje>;
  OrdreLinjeMetadata: ResolverTypeWrapper<OrdreLinjeMetadata>;
  OrdreLinjeRequestMetadata: OrdreLinjeRequestMetadata;
  OrdreLinjeResponse: ResolverTypeWrapper<OrdreLinjeResponse>;
  OrdreLinjeType: OrdreLinjeType;
  Organisasjonsenhet: ResolverTypeWrapper<Organisasjonsenhet>;
  OrganisasjonsenhetResult: ResolverTypeWrapper<OrganisasjonsenhetResult>;
  OrganisasjonsenhetSearch: OrganisasjonsenhetSearch;
  OrganisasjonsenheterSearch: OrganisasjonsenheterSearch;
  OrganisasjonsenhetsKobling: ResolverTypeWrapper<OrganisasjonsenhetsKobling>;
  OrganisasjonsenhetsLeder: ResolverTypeWrapper<OrganisasjonsenhetsLeder>;
  Organisering: ResolverTypeWrapper<Organisering>;
  Person: ResolverTypeWrapper<Person>;
  PersonResult: ResolverTypeWrapper<PersonResult>;
  PersonSearch: PersonSearch;
  Query: ResolverTypeWrapper<{}>;
  Ressurs: ResolverTypeWrapper<Ressurs>;
  RessursKobling: ResolverTypeWrapper<RessursKobling>;
  RessursLeder: ResolverTypeWrapper<RessursLeder>;
  RessursResult: ResolverTypeWrapper<RessursResult>;
  RessursSearch: RessursSearch;
  RessurserSearch: RessurserSearch;
  ResultCode: ResultCode;
  Retning: Retning;
  SearchResult: ResolversTypes['Organisasjonsenhet'] | ResolversTypes['Ressurs'];
  String: ResolverTypeWrapper<Scalars['String']>;
  Telefon: ResolverTypeWrapper<Telefon>;
  TelefonType: TelefonType;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Date: Scalars['Date'];
  DateTime: Scalars['DateTime'];
  ID: Scalars['ID'];
  JSON: Scalars['JSON'];
  Kode: Kode;
  LederOrganisasjonsenhet: LederOrganisasjonsenhet;
  Mutation: {};
  Navn: Navn;
  OpprettEnhetRequest: OpprettEnhetRequest;
  OpprettRessursRequest: OpprettRessursRequest;
  OpprettRessursResponse: OpprettRessursResponse;
  Ordre: Ordre;
  OrdreLinje: OrdreLinje;
  OrdreLinjeMetadata: OrdreLinjeMetadata;
  OrdreLinjeRequestMetadata: OrdreLinjeRequestMetadata;
  OrdreLinjeResponse: OrdreLinjeResponse;
  Organisasjonsenhet: Organisasjonsenhet;
  OrganisasjonsenhetResult: OrganisasjonsenhetResult;
  OrganisasjonsenhetSearch: OrganisasjonsenhetSearch;
  OrganisasjonsenheterSearch: OrganisasjonsenheterSearch;
  OrganisasjonsenhetsKobling: OrganisasjonsenhetsKobling;
  OrganisasjonsenhetsLeder: OrganisasjonsenhetsLeder;
  Organisering: Organisering;
  Person: Person;
  PersonResult: PersonResult;
  PersonSearch: PersonSearch;
  Query: {};
  Ressurs: Ressurs;
  RessursKobling: RessursKobling;
  RessursLeder: RessursLeder;
  RessursResult: RessursResult;
  RessursSearch: RessursSearch;
  RessurserSearch: RessurserSearch;
  SearchResult: ResolversParentTypes['Organisasjonsenhet'] | ResolversParentTypes['Ressurs'];
  String: Scalars['String'];
  Telefon: Telefon;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type KodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Kode'] = ResolversParentTypes['Kode']> = {
  gyldigFom?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  gyldigTom?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  kode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LederOrganisasjonsenhetResolvers<ContextType = any, ParentType extends ResolversParentTypes['LederOrganisasjonsenhet'] = ResolversParentTypes['LederOrganisasjonsenhet']> = {
  organisasjonsenhet?: Resolver<ResolversTypes['Organisasjonsenhet'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  godkjennOrdre?: Resolver<ResolversTypes['ResultCode'], ParentType, ContextType, RequireFields<MutationGodkjennOrdreArgs, 'ordreId'>>;
  opprettEnhet?: Resolver<ResolversTypes['OrdreLinjeResponse'], ParentType, ContextType, RequireFields<MutationOpprettEnhetArgs, 'request'>>;
  opprettRessurs?: Resolver<Maybe<ResolversTypes['OpprettRessursResponse']>, ParentType, ContextType, RequireFields<MutationOpprettRessursArgs, 'personIdent'>>;
  ordreRessurs?: Resolver<ResolversTypes['OrdreLinjeResponse'], ParentType, ContextType, RequireFields<MutationOrdreRessursArgs, 'request'>>;
};

export type NavnResolvers<ContextType = any, ParentType extends ResolversParentTypes['Navn'] = ResolversParentTypes['Navn']> = {
  etternavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fornavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mellomnavn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OpprettRessursResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['OpprettRessursResponse'] = ResolversParentTypes['OpprettRessursResponse']> = {
  navIdent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nomId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  person?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  personIdent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrdreResolvers<ContextType = any, ParentType extends ResolversParentTypes['Ordre'] = ResolversParentTypes['Ordre']> = {
  beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endretTidspunkt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  ordreId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ordreLinjer?: Resolver<Array<ResolversTypes['OrdreLinje']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrdreLinjeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrdreLinje'] = ResolversParentTypes['OrdreLinje']> = {
  data?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['OrdreLinjeMetadata']>, ParentType, ContextType>;
  ordreId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ordreLinjeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['OrdreLinjeType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrdreLinjeMetadataResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrdreLinjeMetadata'] = ResolversParentTypes['OrdreLinjeMetadata']> = {
  beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ordreId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrdreLinjeResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrdreLinjeResponse'] = ResolversParentTypes['OrdreLinjeResponse']> = {
  ordreLinje?: Resolver<ResolversTypes['OrdreLinje'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganisasjonsenhetResolvers<ContextType = any, ParentType extends ResolversParentTypes['Organisasjonsenhet'] = ResolversParentTypes['Organisasjonsenhet']> = {
  agressoId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  gyldigFom?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  gyldigTom?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  koblinger?: Resolver<Array<ResolversTypes['OrganisasjonsenhetsKobling']>, ParentType, ContextType>;
  leder?: Resolver<Array<ResolversTypes['OrganisasjonsenhetsLeder']>, ParentType, ContextType>;
  navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orgNiv?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organiseringer?: Resolver<Array<ResolversTypes['Organisering']>, ParentType, ContextType, Partial<OrganisasjonsenhetOrganiseringerArgs>>;
  type?: Resolver<Maybe<ResolversTypes['Kode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganisasjonsenhetResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrganisasjonsenhetResult'] = ResolversParentTypes['OrganisasjonsenhetResult']> = {
  code?: Resolver<ResolversTypes['ResultCode'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orgNiv?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organisasjonsenhet?: Resolver<Maybe<ResolversTypes['Organisasjonsenhet']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganisasjonsenhetsKoblingResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrganisasjonsenhetsKobling'] = ResolversParentTypes['OrganisasjonsenhetsKobling']> = {
  gyldigFom?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  gyldigTom?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  ressurs?: Resolver<ResolversTypes['Ressurs'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganisasjonsenhetsLederResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrganisasjonsenhetsLeder'] = ResolversParentTypes['OrganisasjonsenhetsLeder']> = {
  ressurs?: Resolver<ResolversTypes['Ressurs'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganiseringResolvers<ContextType = any, ParentType extends ResolversParentTypes['Organisering'] = ResolversParentTypes['Organisering']> = {
  gyldigFom?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  gyldigTom?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  organisasjonsenhet?: Resolver<ResolversTypes['Organisasjonsenhet'], ParentType, ContextType>;
  retning?: Resolver<ResolversTypes['Retning'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<ContextType = any, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  navn?: Resolver<ResolversTypes['Navn'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonResult'] = ResolversParentTypes['PersonResult']> = {
  navIdent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nomId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  person?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  personIdent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  ordre?: Resolver<Maybe<ResolversTypes['Ordre']>, ParentType, ContextType, RequireFields<QueryOrdreArgs, 'ordreId'>>;
  ordreBulk?: Resolver<Array<ResolversTypes['Ordre']>, ParentType, ContextType, Partial<QueryOrdreBulkArgs>>;
  organisasjonsenhet?: Resolver<Maybe<ResolversTypes['Organisasjonsenhet']>, ParentType, ContextType, Partial<QueryOrganisasjonsenhetArgs>>;
  organisasjonsenheter?: Resolver<Array<ResolversTypes['OrganisasjonsenhetResult']>, ParentType, ContextType, Partial<QueryOrganisasjonsenheterArgs>>;
  person?: Resolver<Maybe<ResolversTypes['PersonResult']>, ParentType, ContextType, Partial<QueryPersonArgs>>;
  ressurs?: Resolver<Maybe<ResolversTypes['Ressurs']>, ParentType, ContextType, Partial<QueryRessursArgs>>;
  ressurser?: Resolver<Array<ResolversTypes['RessursResult']>, ParentType, ContextType, Partial<QueryRessurserArgs>>;
  search?: Resolver<Array<ResolversTypes['SearchResult']>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'term'>>;
};

export type RessursResolvers<ContextType = any, ParentType extends ResolversParentTypes['Ressurs'] = ResolversParentTypes['Ressurs']> = {
  epost?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  etternavn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fornavn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  koblinger?: Resolver<Array<ResolversTypes['RessursKobling']>, ParentType, ContextType>;
  lederFor?: Resolver<Array<ResolversTypes['LederOrganisasjonsenhet']>, ParentType, ContextType>;
  ledere?: Resolver<Array<ResolversTypes['RessursLeder']>, ParentType, ContextType>;
  navIdent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nomId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  person?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  personIdent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  telefon?: Resolver<Array<ResolversTypes['Telefon']>, ParentType, ContextType>;
  visningsNavn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RessursKoblingResolvers<ContextType = any, ParentType extends ResolversParentTypes['RessursKobling'] = ResolversParentTypes['RessursKobling']> = {
  gyldigFom?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  gyldigTom?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  organisasjonsenhet?: Resolver<ResolversTypes['Organisasjonsenhet'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RessursLederResolvers<ContextType = any, ParentType extends ResolversParentTypes['RessursLeder'] = ResolversParentTypes['RessursLeder']> = {
  ressurs?: Resolver<ResolversTypes['Ressurs'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RessursResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['RessursResult'] = ResolversParentTypes['RessursResult']> = {
  code?: Resolver<ResolversTypes['ResultCode'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ressurs?: Resolver<Maybe<ResolversTypes['Ressurs']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SearchResult'] = ResolversParentTypes['SearchResult']> = {
  __resolveType: TypeResolveFn<'Organisasjonsenhet' | 'Ressurs', ParentType, ContextType>;
};

export type TelefonResolvers<ContextType = any, ParentType extends ResolversParentTypes['Telefon'] = ResolversParentTypes['Telefon']> = {
  beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TelefonType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  Kode?: KodeResolvers<ContextType>;
  LederOrganisasjonsenhet?: LederOrganisasjonsenhetResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Navn?: NavnResolvers<ContextType>;
  OpprettRessursResponse?: OpprettRessursResponseResolvers<ContextType>;
  Ordre?: OrdreResolvers<ContextType>;
  OrdreLinje?: OrdreLinjeResolvers<ContextType>;
  OrdreLinjeMetadata?: OrdreLinjeMetadataResolvers<ContextType>;
  OrdreLinjeResponse?: OrdreLinjeResponseResolvers<ContextType>;
  Organisasjonsenhet?: OrganisasjonsenhetResolvers<ContextType>;
  OrganisasjonsenhetResult?: OrganisasjonsenhetResultResolvers<ContextType>;
  OrganisasjonsenhetsKobling?: OrganisasjonsenhetsKoblingResolvers<ContextType>;
  OrganisasjonsenhetsLeder?: OrganisasjonsenhetsLederResolvers<ContextType>;
  Organisering?: OrganiseringResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonResult?: PersonResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Ressurs?: RessursResolvers<ContextType>;
  RessursKobling?: RessursKoblingResolvers<ContextType>;
  RessursLeder?: RessursLederResolvers<ContextType>;
  RessursResult?: RessursResultResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  Telefon?: TelefonResolvers<ContextType>;
};



export const HentOrganiasjonsEnheterMedHierarkiDocument = gql`
    query hentOrganiasjonsEnheterMedHierarki($aid: String, $oniv: String) {
  organisasjonsenhet(where: {agressoId: $aid, orgNiv: $oniv}) {
    agressoId
    orgNiv
    navn
    gyldigFom
    gyldigTom
    underenheter: organiseringer(retning: under) {
      organisasjonsenhet {
        navn
        agressoId
        orgNiv
        type {
          kode
          navn
        }
      }
    }
    overenheter: organiseringer(retning: over) {
      retning
      organisasjonsenhet {
        navn
        agressoId
        orgNiv
        organiseringer(retning: over) {
          retning
          organisasjonsenhet {
            navn
            agressoId
            orgNiv
            organiseringer(retning: over) {
              retning
              organisasjonsenhet {
                navn
                agressoId
                orgNiv
                organiseringer(retning: over) {
                  retning
                  organisasjonsenhet {
                    navn
                    agressoId
                    orgNiv
                    organiseringer(retning: over) {
                      retning
                      organisasjonsenhet {
                        navn
                        agressoId
                        orgNiv
                        organiseringer(retning: over) {
                          retning
                          organisasjonsenhet {
                            navn
                            agressoId
                            orgNiv
                            organiseringer(retning: over) {
                              retning
                              organisasjonsenhet {
                                navn
                                agressoId
                                orgNiv
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    leder {
      ressurs {
        navIdent
        personIdent
        person {
          navn {
            fornavn
            mellomnavn
            etternavn
          }
        }
      }
    }
    koblinger {
      ressurs {
        navIdent
        personIdent
        person {
          navn {
            fornavn
            mellomnavn
            etternavn
          }
        }
      }
    }
    type {
      kode
      navn
    }
  }
}
    `;

/**
 * __useHentOrganiasjonsEnheterMedHierarkiQuery__
 *
 * To run a query within a React component, call `useHentOrganiasjonsEnheterMedHierarkiQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentOrganiasjonsEnheterMedHierarkiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentOrganiasjonsEnheterMedHierarkiQuery({
 *   variables: {
 *      aid: // value for 'aid'
 *      oniv: // value for 'oniv'
 *   },
 * });
 */
export function useHentOrganiasjonsEnheterMedHierarkiQuery(baseOptions?: Apollo.QueryHookOptions<HentOrganiasjonsEnheterMedHierarkiQuery, HentOrganiasjonsEnheterMedHierarkiQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentOrganiasjonsEnheterMedHierarkiQuery, HentOrganiasjonsEnheterMedHierarkiQueryVariables>(HentOrganiasjonsEnheterMedHierarkiDocument, options);
      }
export function useHentOrganiasjonsEnheterMedHierarkiLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentOrganiasjonsEnheterMedHierarkiQuery, HentOrganiasjonsEnheterMedHierarkiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentOrganiasjonsEnheterMedHierarkiQuery, HentOrganiasjonsEnheterMedHierarkiQueryVariables>(HentOrganiasjonsEnheterMedHierarkiDocument, options);
        }
export type HentOrganiasjonsEnheterMedHierarkiQueryHookResult = ReturnType<typeof useHentOrganiasjonsEnheterMedHierarkiQuery>;
export type HentOrganiasjonsEnheterMedHierarkiLazyQueryHookResult = ReturnType<typeof useHentOrganiasjonsEnheterMedHierarkiLazyQuery>;
export type HentOrganiasjonsEnheterMedHierarkiQueryResult = Apollo.QueryResult<HentOrganiasjonsEnheterMedHierarkiQuery, HentOrganiasjonsEnheterMedHierarkiQueryVariables>;
export const HentRessursDocument = gql`
    query hentRessurs($navIdent: String) {
  ressurs(where: {navIdent: $navIdent}) {
    fornavn
    etternavn
  }
}
    `;

/**
 * __useHentRessursQuery__
 *
 * To run a query within a React component, call `useHentRessursQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentRessursQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentRessursQuery({
 *   variables: {
 *      navIdent: // value for 'navIdent'
 *   },
 * });
 */
export function useHentRessursQuery(baseOptions?: Apollo.QueryHookOptions<HentRessursQuery, HentRessursQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentRessursQuery, HentRessursQueryVariables>(HentRessursDocument, options);
      }
export function useHentRessursLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentRessursQuery, HentRessursQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentRessursQuery, HentRessursQueryVariables>(HentRessursDocument, options);
        }
export type HentRessursQueryHookResult = ReturnType<typeof useHentRessursQuery>;
export type HentRessursLazyQueryHookResult = ReturnType<typeof useHentRessursLazyQuery>;
export type HentRessursQueryResult = Apollo.QueryResult<HentRessursQuery, HentRessursQueryVariables>;
export const HentAlleOrganisasjonsenheterDocument = gql`
    query HentAlleOrganisasjonsenheter {
  organisasjonsenheter {
    id
    orgNiv
    organisasjonsenhet {
      orgNiv
      agressoId
      navn
    }
    code
  }
}
    `;

/**
 * __useHentAlleOrganisasjonsenheterQuery__
 *
 * To run a query within a React component, call `useHentAlleOrganisasjonsenheterQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentAlleOrganisasjonsenheterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentAlleOrganisasjonsenheterQuery({
 *   variables: {
 *   },
 * });
 */
export function useHentAlleOrganisasjonsenheterQuery(baseOptions?: Apollo.QueryHookOptions<HentAlleOrganisasjonsenheterQuery, HentAlleOrganisasjonsenheterQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentAlleOrganisasjonsenheterQuery, HentAlleOrganisasjonsenheterQueryVariables>(HentAlleOrganisasjonsenheterDocument, options);
      }
export function useHentAlleOrganisasjonsenheterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentAlleOrganisasjonsenheterQuery, HentAlleOrganisasjonsenheterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentAlleOrganisasjonsenheterQuery, HentAlleOrganisasjonsenheterQueryVariables>(HentAlleOrganisasjonsenheterDocument, options);
        }
export type HentAlleOrganisasjonsenheterQueryHookResult = ReturnType<typeof useHentAlleOrganisasjonsenheterQuery>;
export type HentAlleOrganisasjonsenheterLazyQueryHookResult = ReturnType<typeof useHentAlleOrganisasjonsenheterLazyQuery>;
export type HentAlleOrganisasjonsenheterQueryResult = Apollo.QueryResult<HentAlleOrganisasjonsenheterQuery, HentAlleOrganisasjonsenheterQueryVariables>;