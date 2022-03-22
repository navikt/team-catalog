import {Select, Value} from "baseui/select";
import * as React from "react";
import {Field, FieldProps} from "formik";
import {Status, ProductAreaFormValues} from "../../constants";
import {Block} from "baseui/block";

const FieldStatus = (props: {status: Status | string}) => {
  const {status} = props
  const [value, setValue] = React.useState<Value>(status ? [{
      id: Object.keys(Status)[Object.values(Status).indexOf(status as Status)], label: status}] :
      [{id: Object.keys(Status)[Object.values(Status).indexOf(Status.ACTIVE as Status)], label: Status.ACTIVE}])
  
  return (
    <Field
      name='status'
      render={({form}: FieldProps<ProductAreaFormValues>) => (
        <Block width={"100%"} maxWidth={"630px"}>
          <Select
            options={Object.values(Status).map(st => ({id: Object.keys(Status)[Object.values(Status).indexOf(st as Status)], label: st}))}
            onChange={({value}) => {
              setValue(value)
              form.setFieldValue('status', value.length > 0 ? Object.keys(Status)[Object.values(Status).indexOf(value[0].id as Status)] : '')
            }}
            value={value}
            placeholder='Velg en status'
            clearable={false}
            backspaceRemoves={false}
          />
        </Block>
      )}
    />
  )
}

export default FieldStatus