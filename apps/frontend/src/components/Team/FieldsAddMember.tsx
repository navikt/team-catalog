import * as React from 'react'
import { Block } from 'baseui/block'
import { Input, SIZE } from 'baseui/input'
import Button from '../common/Button'
import { Member } from '../../constants'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Formik, FormikProps, Form, Field, FieldProps } from 'formik'
import { memberSchema } from '../common/schema'


let initialValues = {
    navIdent: '',
    name: '',
    role: ''
} as Member

type FieldsAddMemberProps = {
    submit: Function,
}

const FieldsAddMember = (props: FieldsAddMemberProps) => {

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
                    <Block display="flex" justifyContent="space-between">
                        <Field name="navIdent">
                            {(props: FieldProps) =>
                                <Input type="text" size={SIZE.default} {...props.field} placeholder="Nav-Ident" />
                            }
                        </Field>
                        <Field name="name">
                            {(props: FieldProps) =>
                                <Input type="text" size={SIZE.default} {...props.field} placeholder="Navn" />
                            }
                        </Field>
                        <Field name="role">
                            {(props: FieldProps) =>
                                <Input type="text" size={SIZE.default} {...props.field} placeholder="Rolle" />
                            }
                        </Field>

                        <Button tooltip="Legg til medlem" kind="minimal" type="submit">
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    </Block>

                </Form>

            )} />
    )
}

export default FieldsAddMember