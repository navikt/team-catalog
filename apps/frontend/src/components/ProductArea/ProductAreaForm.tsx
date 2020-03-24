import * as React from 'react'
import { Field, FieldArray, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik'
import { H4, Paragraph2, Label2 } from 'baseui/typography'
import { ProductAreaFormValues } from '../../constants'
import { BlockProps, Block } from 'baseui/block'
import { Input, SIZE } from 'baseui/input'
import { Textarea } from 'baseui/textarea'
import Button from '../common/Button'
import { Value, Select } from 'baseui/select'

const rowBlockProps: BlockProps = {
    width: '40%',
    marginBottom: '2rem',
}
const buttonRowBlockProps: BlockProps = {
    width: '40%',
    display: "flex",
    justifyContent: 'flex-end',
    marginTop: "2rem"
}

type ProductAreaFormProps = {
    initialValues: ProductAreaFormValues;
    handleSubmit: Function;
}

const ProductAreaForm = (props: ProductAreaFormProps) => {
    const [description, setDescription] = React.useState('')
    const [selectValue, setSelectValue] = React.useState<Value>([])
    const { initialValues, handleSubmit } = props

    const disableEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault()
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
        >
            {
                (formikProps: FormikProps<ProductAreaFormValues>) => (
                    <Form>
                        <Block {...rowBlockProps}>
                            <>
                                <Label2>Navn</Label2>
                                <Field name="name">
                                    {(props: FieldProps) =>
                                        <Input type="text" size={SIZE.default} {...props.field} />
                                    }
                                </Field>
                            </>
                        </Block>
                        <Block {...rowBlockProps}>
                            <>
                                <Label2>Beskrivelse</Label2>
                                <Field name="description">
                                    {(props: FieldProps) =>
                                        <Textarea
                                            value={description}
                                            onChange={event => setDescription((event.target as HTMLTextAreaElement).value)}
                                            {...props.field}
                                        />
                                    }
                                </Field>
                            </>
                        </Block>

                        <Block {...rowBlockProps}>
                            <>
                                <Label2>Legg til teams for produktområdet</Label2>
                                <Field>
                                    {(props: FieldProps) =>
                                        <Select
                                            options={[]}
                                            onChange={({ value }) => setSelectValue(value)}
                                            value={selectValue}
                                            placeholder="Velg et team som skal legges til"
                                            disabled
                                        />
                                    }
                                </Field>
                            </>
                        </Block>

                        <Block {...buttonRowBlockProps}>
                            <Button
                                type="button"
                                kind="secondary"
                                onClick={() => window.history.back()}
                            >
                                Avbryt
                            </Button>
                            <Button
                                type="submit"
                                kind="primary"
                                marginLeft
                            >
                                Lagre
                            </Button>
                        </Block>
                    </Form>
                )
            }
        </Formik>
    )
}

export default ProductAreaForm