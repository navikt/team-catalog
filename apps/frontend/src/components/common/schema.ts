import * as yup from 'yup';
import {
  AddressType,
  AreaType,
  ClusterFormValues,
  ContactAddress,
  Location,
  MemberFormValues,
  ProductAreaFormValues,
  ProductAreaOwnerGroupFormValues,
  ProductTeamFormValues,
  ResourceType,
  Status,
  TeamRole,
  TeamType
} from '../../constants';

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema: () => yup.SchemaOf<ProductAreaFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    areaType: yup.mixed().oneOf(Object.values(AreaType), errorMessage).required(errorMessage),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    status: yup.mixed().oneOf(Object.keys(Status), errorMessage).required(errorMessage),
    members: yup.array().of(memberSchema()).required(),
    tags: yup.array().of(yup.string().required()).required(),
    locations: yup.array().of(location()).required(),
    ownerGroup: paOwnerGroupSchema.optional().default(undefined)
 });

const location: () => yup.SchemaOf<Location> = () =>
  yup.object({
    floorId: yup.string().required(errorMessage),
    locationCode: yup.string().required(errorMessage),
    x: yup.number().required(errorMessage),
    y: yup.number().required(errorMessage)
  })

export const clusterSchema: () => yup.SchemaOf<ClusterFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    tags: yup.array().of(yup.string().required()).required(),
    productAreaId: yup.string(),
    members: yup.array().of(memberSchema()).required()
  });

const contactAddress: () => yup.SchemaOf<ContactAddress> = () =>
  yup.object({
    address: yup.string().required(errorMessage),
    type: yup.mixed().oneOf(Object.values(AddressType), errorMessage).required(errorMessage),
    slackUser: yup.mixed().nullable(),
    slackChannel: yup.mixed().nullable()
  })

export const teamSchema: () => yup.SchemaOf<ProductTeamFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    productAreaId: yup.string().required(errorMessage),
    clusterIds: yup.array().of(yup.string().required()).required(),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    contactPersonIdent: yup.string(),
    contactPersonResource: yup.mixed().optional(),
    naisTeams: yup.array().of(yup.string().required()).required(),
    members: yup.array().of(memberSchema().required()).required(),
    qaTime: yup.string(),
    teamType: yup.mixed().oneOf(Object.values(TeamType), errorMessage).required(errorMessage),
    tags: yup.array().of(yup.string().required()).required(),
    locations: yup.array().of(location()).required(),
    contactAddresses: yup.array().of(contactAddress()).required(),
    teamOwnerIdent: yup.string(),
    teamOwnerResource: yup.mixed().optional(),
    location: yup.mixed().optional(),
    officeHours: yup.mixed().optional()
  });

const roleSchema: yup.SchemaOf<TeamRole> = yup.mixed().oneOf(Object.values(TeamRole), errorMessage + ": Rolle").required(errorMessage)

const navIdentSchema : yup.SchemaOf<string> = yup.string().matches(/[a-bA-Z]\d{6}/,{message: "Ugyldig (Invalid) nav-ident"}).required();

const paOwnerGroupSchema: yup.SchemaOf<ProductAreaOwnerGroupFormValues> = yup.object({
  ownerGroupMemberNavIdList: yup.array().of(navIdentSchema).required().default([]),
  ownerNavId: navIdentSchema.default(undefined)
})

export const memberSchema: () => yup.SchemaOf<MemberFormValues> = () =>
  yup.object({
    navIdent: yup.string().required(errorMessage + ": Ansatt"),
    roles: yup.array().of(roleSchema).min(1, errorMessage + ": Rolle").required(),
    description: yup.string(),
    fullName: yup.string(),
    resourceType: yup.mixed().oneOf(Object.values(ResourceType))
  });
