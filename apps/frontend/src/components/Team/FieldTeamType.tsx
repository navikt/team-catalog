import {Select, Value} from "baseui/select";
import * as React from "react";
import {Field, FieldProps} from "formik";
import {ProductTeamFormValues, TeamType} from "../../constants";
import {Block} from "baseui/block";
import {intl} from "../../util/intl/intl";

const FieldTeamType = (props: {teamType: TeamType}) => {
  const {teamType} = props
  const [value, setValue] = React.useState<Value>(teamType?[{id:teamType,label:intl[teamType]}]:[])
  return (
    <Field
      name='teamType'
      render={({form}: FieldProps<ProductTeamFormValues>) => (
        <Block marginRight='10px' width='100%'>
          <Select
            options={Object.values(TeamType).map(tt => ({id: tt, label: intl[tt]}))}
            onChange={({value}) => {
              setValue(value)
              form.setFieldValue('teamType', value.length > 0 ? value[0].id : '')
            }}
            value={value}
            placeholder='Velg en teamtype'
          />
        </Block>
      )}
    />
  )
}

export default FieldTeamType
