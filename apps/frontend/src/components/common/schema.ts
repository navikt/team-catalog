import * as yup from "yup";
import { ProductAreaFormValues, ProductTeamFormValues, Member } from "../../constants";

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema = () =>
  yup.object<ProductAreaFormValues>({
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage)
  });

export const memberSchema = () =>
  yup.object<Member>({
    navIdent: yup.string(),
    name: yup.string(),
    role: yup.string(),
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
    members: yup.array(memberSchema())
  });
