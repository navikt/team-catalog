import { Option, Select, Value } from "baseui/select";
import * as React from "react";
import { Field, FieldProps } from "formik";
import { ProductTeamFormValues } from "../../constants";
import { Block } from "baseui/block";

const FieldProductArea = (props: { options: Option[]; initialValue: Value }) => {
  const { options, initialValue } = props;
  const [value, setValue] = React.useState<Value>(initialValue);

  return (
    <Field
      name="productAreaId"
      render={({ form }: FieldProps<ProductTeamFormValues>) => (
        <Block width="100%" maxWidth={"630px"}>
          <Select
            required
            options={options}
            onChange={({ value }) => {
              setValue(value);
              form.setFieldValue("productAreaId", value.length > 0 ? value[0].id : "");
            }}
            value={value}
            placeholder="Velg ett område"
          />
        </Block>
      )}
    />
  );
};

export default FieldProductArea;
