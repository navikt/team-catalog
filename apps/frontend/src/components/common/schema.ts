import * as yup from "yup";
import { ProductAreaFormValues } from "../../constants";

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema = () =>
  yup.object<ProductAreaFormValues>({
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage)
  });
