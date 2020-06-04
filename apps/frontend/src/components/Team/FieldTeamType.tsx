import {Select, Value} from "baseui/select";
import * as React from "react";
import {Field, FieldProps} from "formik";
import {ProductTeamFormValues, TeamType} from "../../constants";
import {Block} from "baseui/block";
import {intl} from "../../util/intl/intl";

const FieldTeamType = (props: { teamType: TeamType }) => {
  const {teamType} = props
  const [value, setValue] = React.useState<Value>(teamType ? [{id: teamType, label: intl.getString(teamType + "_DESCRIPTION")}] : [])
  return (
    <Field
      name='teamType'
      render={({form}: FieldProps<ProductTeamFormValues>) => (
        <Block width={"100%"} maxWidth={"630px"}>
          <Select
            options={Object.values(TeamType).map(tt => ({id: tt, label: intl.getString(tt + "_DESCRIPTION")}))}
            onChange={({value}) => {
              setValue(value)
              form.setFieldValue('teamType', value.length > 0 ? value[0].id : '')
            }}
            value={value}
            placeholder='Velg en teamtype'
            clearable={false}
            backspaceRemoves={false}
          />
        </Block>
      )}
    />
  )
}

export default FieldTeamType
