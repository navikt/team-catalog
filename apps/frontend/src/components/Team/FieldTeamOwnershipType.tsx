import {Select, Value} from "baseui/select";
import * as React from "react";
import {Field, FieldProps} from "formik";
import {ProductTeamFormValues, TeamOwnershipType } from "../../constants";
import {Block} from "baseui/block";
import {intl} from "../../util/intl/intl";

const FieldTeamOwnershipType = (props: { teamOwnershipType: TeamOwnershipType }) => {
  const {teamOwnershipType} = props
  const [value, setValue] = React.useState<Value>(teamOwnershipType ? [{id: teamOwnershipType, label: intl.getString(teamOwnershipType + "_DESCRIPTION")}] : [])
  return (
    <Field
      name='teamOwnershipType'
      render={({form}: FieldProps<ProductTeamFormValues>) => (
        <Block width={"100%"} maxWidth={"630px"}>
          <Select
            options={Object.values(TeamOwnershipType).map(tt => ({id: tt, label: intl.getString(tt + "_DESCRIPTION")}))}
            onChange={({value}) => {
              setValue(value)
              form.setFieldValue('teamOwnershipType', value.length > 0 ? value[0].id : '')
            }}
            value={value}
            placeholder='Velg en team eierskap type'
            clearable={false}
            backspaceRemoves={false}
          />
        </Block>
      )}
    />
  )
}

export default FieldTeamOwnershipType
