import * as yup from "yup";
import { Member, ProductAreaFormValues, ProductTeamFormValues, TeamRole, TeamType } from "../../constants";

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema = () =>
  yup.object<ProductAreaFormValues>({
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage)
  });

export const memberSchema = () =>
  yup.object<Member>({
    navIdent: yup.string().required(errorMessage + ": Ansatt"),
    name: yup.string(),
    roles: yup.array(yup.mixed().oneOf(Object.values(TeamRole), errorMessage + ": Rolle")).required(errorMessage + ": Rolle"),
    description: yup.string(),
    email: yup.string(),
    resourceType: yup.string()
  });

export const teamSchema = () =>
  yup.object<ProductTeamFormValues>({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    productAreaId: yup.string(),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    naisTeams: yup.array(yup.string()),
    members: yup.array(memberSchema()),
    teamLeadQA: yup.boolean(),
    teamType: yup.mixed().oneOf(Object.values(TeamType), errorMessage).required(errorMessage)
  });
