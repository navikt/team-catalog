import * as yup from 'yup';
import {Schema} from 'yup';
import {MemberFormValues, ProductAreaFormValues, ProductTeamFormValues, TeamRole, TeamType} from '../../constants';

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema = () =>
  yup.object<ProductAreaFormValues>({
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage),
    members: yup.array().of(memberSchema()),
    tags: yup.array().of(yup.string())
  });

export const teamSchema = () =>
  yup.object<ProductTeamFormValues>({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    productAreaId: yup.string(),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    naisTeams: yup.array().of(yup.string()),
    members: yup.array().of(memberSchema()),
    teamLeadQA: yup.boolean(),
    teamType: yup.mixed().oneOf(Object.values(TeamType), errorMessage).required(errorMessage),
    tags: yup.array().of(yup.string())
  });

const roleSchema: Schema<TeamRole> = yup.mixed().oneOf(Object.values(TeamRole), errorMessage + ": Rolle").required(errorMessage)

export const memberSchema = () =>
  yup.object<MemberFormValues>({
    navIdent: yup.string().required(errorMessage + ": Ansatt"),
    roles: yup.array().of(roleSchema).required(errorMessage + ": Rolle"),
    description: yup.string(),
  });
