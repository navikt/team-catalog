import * as yup from 'yup';
import {AreaType, ClusterFormValues, Location, MemberFormValues, ProductAreaFormValues, ProductTeamFormValues, ResourceType, TeamRole, TeamType} from '../../constants';

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema: () => yup.SchemaOf<ProductAreaFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    areaType: yup.mixed().oneOf(Object.values(AreaType), errorMessage).required(errorMessage),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    members: yup.array().of(memberSchema()).required(),
    tags: yup.array().of(yup.string()).required(),
    locations: yup.array().of(location()).required()
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
    tags: yup.array().of(yup.string()).required(),
    productAreaId: yup.string(),
    members: yup.array().of(memberSchema()).required()
  });

export const teamSchema: () => yup.SchemaOf<ProductTeamFormValues> = () =>
  yup.object({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    productAreaId: yup.string(),
    clusterIds: yup.array().of(yup.string()).required(),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    naisTeams: yup.array().of(yup.string()).required(),
    members: yup.array().of(memberSchema()).required(),
    qaTime: yup.string(),
    teamType: yup.mixed().oneOf(Object.values(TeamType), errorMessage).required(errorMessage),
    tags: yup.array().of(yup.string()).required(),
    locations: yup.array().of(location()).required()
  });

const roleSchema: yup.SchemaOf<TeamRole> = yup.mixed().oneOf(Object.values(TeamRole), errorMessage + ": Rolle").required(errorMessage)

export const memberSchema: () => yup.SchemaOf<MemberFormValues> = () =>
  yup.object({
    navIdent: yup.string().required(errorMessage + ": Ansatt"),
    roles: yup.array().of(roleSchema).min(1, errorMessage + ": Rolle").required(),
    description: yup.string(),
    fullName: yup.string(),
    resourceType: yup.mixed().oneOf(Object.values(ResourceType))
  });
