import * as React from 'react'
import { Select, Value } from 'baseui/select'
import { useNaisTeamSearch } from '../../api/teamApi'
import { Field, FieldProps } from 'formik'
import { ProductTeamFormValues } from '../../constants'
import { Block } from 'baseui/block'

const FieldNaisTeam = (props: { onAdd: Function }) => {
    const [value, setValue] = React.useState<Value>([])
    const [teamSearchResult, setTeamSearch, teamSearchLoading] = useNaisTeamSearch()

    return (
        <Field
            name='naisTeam'
            render={({ form, field }: FieldProps<ProductTeamFormValues>) => (
                <Block width={'100%'}>
                    <Select
                        options={teamSearchResult}
                        maxDropdownHeight="400px"
                        onChange={({ value }) => {
                            setValue(value)
                            form.setFieldValue('naisTeam', value && value.length > 0 ? value[0].id : '')
                            if (props.onAdd && value.length > 0) props.onAdd(value[0].id)
                        }}
                        onInputChange={event => setTeamSearch(event.currentTarget.value)}
                        value={value}
                        isLoading={teamSearchLoading}
                        placeholder="Søk og legg til teams"
                    />
                </Block>
            )}
        />
    )
}

export default FieldNaisTeam
