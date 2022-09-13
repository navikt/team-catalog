import { Select, Value } from 'baseui/select'
import * as React from 'react'
import { Field, FieldProps } from 'formik'
import { ProductTeamFormValues, TeamOwnershipType, TeamType } from '../../constants'
import { Block } from 'baseui/block'
import { intl } from '../../util/intl/intl'

const FieldTeamType = (props: { teamtype: TeamType }) => {
  const { teamtype } = props
  const [value, setValue] = React.useState<Value>(teamtype ? [{ id: teamtype, label: intl.getString(teamtype + '_DESCRIPTION') }] : [])
  return (
    <Field
      name="teamtype"
      render={({ form }: FieldProps<ProductTeamFormValues>) => (
        <Block width={'100%'} maxWidth={'630px'}>
          <Select
            options={Object.values(TeamType).map((tt) => ({ id: tt, label: intl.getString(tt + '_DESCRIPTION') }))}
            onChange={({ value }) => {
              setValue(value)
              form.setFieldValue('teamType', value.length > 0 ? value[0].id : '')
            }}
            value={value}
            placeholder="Velg en team type"
            clearable={false}
            backspaceRemoves={false}
          />
        </Block>
      )}
    />
  )
}

export default FieldTeamType
