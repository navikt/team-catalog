import * as yup from 'yup';
import {Schema} from 'yup';
import {AreaType, ClusterFormValues, MemberFormValues, ProductAreaFormValues, ProductTeamFormValues, TeamRole, TeamType} from '../../constants';

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema = () =>
  yup.object<ProductAreaFormValues>({
    name: yup.string().required(errorMessage),
    areaType: yup.mixed().oneOf(Object.values(AreaType), errorMessage).required(errorMessage),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    members: yup.array().of(memberSchema()),
    tags: yup.array().of(yup.string()),
    locations: yup.array()
  });

export const clusterSchema = () =>
  yup.object<ClusterFormValues>({
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    tags: yup.array().of(yup.string()),
    productAreaId: yup.string(),
    members: yup.array().of(memberSchema())
  });

export const teamSchema = () =>
  yup.object<ProductTeamFormValues>({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    productAreaId: yup.string(),
    clusterIds: yup.array().of(yup.string()),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    naisTeams: yup.array().of(yup.string()),
    members: yup.array().of(memberSchema()),
    qaTime: yup.string(),
    teamType: yup.mixed().oneOf(Object.values(TeamType), errorMessage).required(errorMessage),
    tags: yup.array().of(yup.string()),
    locations: yup.array()
  });

const roleSchema: Schema<TeamRole> = yup.mixed().oneOf(Object.values(TeamRole), errorMessage + ": Rolle").required(errorMessage)

export const memberSchema = () =>
  yup.object<MemberFormValues>({
    navIdent: yup.string().required(errorMessage + ": Ansatt"),
    roles: yup.array().of(roleSchema).min(1, errorMessage + ": Rolle"),
    description: yup.string(),
  });
