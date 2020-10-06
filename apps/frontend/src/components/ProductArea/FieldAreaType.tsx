import {Select, Value} from "baseui/select";
import * as React from "react";
import {Field, FieldProps} from "formik";
import {AreaType, ProductAreaFormValues} from "../../constants";
import {Block} from "baseui/block";
import {intl} from "../../util/intl/intl";

const FieldAreaType = (props: {areaType: AreaType}) => {
  const {areaType} = props
  const [value, setValue] = React.useState<Value>(areaType ? [{id: areaType, label: intl.getString(areaType + "_AREATYPE_DESCRIPTION")}] : [])
  return (
    <Field
      name='areaType'
      render={({form}: FieldProps<ProductAreaFormValues>) => (
        <Block width={"100%"} maxWidth={"630px"}>
          <Select
            options={Object.values(AreaType).map(at => ({id: at, label: intl.getString(at + "_AREATYPE_DESCRIPTION")}))}
            onChange={({value}) => {
              setValue(value)
              form.setFieldValue('areaType', value.length > 0 ? value[0].id : '')
            }}
            value={value}
            placeholder='Velg en områdetype'
            clearable={false}
            backspaceRemoves={false}
          />
        </Block>
      )}
    />
  )
}

export default FieldAreaType
