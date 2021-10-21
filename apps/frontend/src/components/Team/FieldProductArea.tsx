import { Option, Select, Value } from "baseui/select";
import * as React from "react";
import { Field, FieldProps } from "formik";
import { ProductTeamFormValues } from "../../constants";
import { Block } from "baseui/block";

const FieldProductArea = (props: { options: Option[]; initialValue: Value, selectCallback?: (value: Value) => void}) => {
  const { options, initialValue, selectCallback } = props;
  const [value, setValue] = React.useState<Value>(initialValue);

  React.useEffect(() => selectCallback && selectCallback(initialValue),[])

  return (
    <Field
      name="productAreaId"
      render={({ form }: FieldProps<ProductTeamFormValues>) => (
        <Block width="100%" maxWidth={"630px"}>
          <Select
            options={options}
            onChange={({ value }) => {
              setValue(value);
              form.setFieldValue("productAreaId", value.length > 0 ? value[0].id : "");
              selectCallback && selectCallback(value)
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
