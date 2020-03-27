import * as React from 'react'
import { Block } from 'baseui/block'
import { Input, SIZE } from 'baseui/input'
import Button from '../common/Button'
import { Member } from '../../constants'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import { memberSchema } from '../common/schema'
import { Select, Value } from 'baseui/select'
import { useResourceSearch } from '../../api/resourceApi'
import { theme } from '../../util'

let initialValues = {
    navIdent: '',
    name: '',
    role: ''
} as Member

type FieldsAddMemberProps = {
    submit: Function,
}

const FormAddMember = (props: FieldsAddMemberProps) => {
    const [value, setValue] = React.useState<Value>([])
    const [searchResult, setResourceSearch, loading] = useResourceSearch()

    const { submit } = props

    const disableEnter = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault()
    }

    return (
        <Formik
            onSubmit={(values) => submit(values)}
            validationSchema={memberSchema()}
            initialValues={initialValues}
            enableReinitialize
            render={(form: FormikProps<Member>) => (
                <Form onKeyDown={disableEnter}>
                    <Block display="flex" justifyContent="space-between" width="100%">
                        <Block width="60%" marginRight={theme.sizing.scale400}>
                            <Select
                                options={!loading ? searchResult : []}
                                filterOptions={options => options}
                                maxDropdownHeight="400px"
                                onChange={({ value }) => {
                                    setValue(value)
                                    form.setFieldValue('name', value.length > 0 ? value[0].name : '')
                                    form.setFieldValue('navIdent', value.length > 0 ? value[0].id : '')
                                }}
                                onInputChange={async event => setResourceSearch(event.currentTarget.value)}
                                value={value}
                                isLoading={loading}
                                placeholder="Søk etter ansatte"
                                labelKey="display"
                            />
                        </Block>
                        <Block>
                            <Field name="role">
                                {(props: FieldProps) =>
                                    <Input type="text" size={SIZE.default} {...props.field} placeholder="Rolle" />
                                }
                            </Field>
                        </Block>

                        <Button tooltip="Legg til medlem" kind="minimal" type="submit">
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    </Block>

                </Form>

            )} />
    )
}

export default FormAddMember
