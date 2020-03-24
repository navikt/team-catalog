import * as React from 'react'
import { KeyboardEvent } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'
import { Field, FieldProps, Form, Formik, FormikProps, FieldArray, } from 'formik'
import { Block, BlockProps } from 'baseui/block'
import { ProductTeamFormValues, Member } from '../../constants'
import CustomizedModalBlock from '../common/CustomizedModalBlock'
import { ModalLabel } from '../common/ModalSchema'
import { Input } from 'baseui/input'
import { Textarea } from 'baseui/textarea'
import Button from '../common/Button'
import { KIND } from 'baseui/button'
import { Option, Select, Value } from 'baseui/select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ListItem, ListItemLabel } from 'baseui/list';
import FieldNaisTeam from './FieldNaisTeam'
import { renderTagList } from '../common/TagList'


const modalBlockProps: BlockProps = {
    width: '900px',
    paddingRight: '2rem',
    paddingLeft: '2rem',
}

const rowBlockProps: BlockProps = {
    display: 'flex',
    width: '100%',
    marginTop: '1rem',
}

const modalHeaderProps: BlockProps = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem'
}

const FieldProductArea = (props: { options: Option[] }) => {
    const { options } = props
    const [value, setValue] = React.useState<Value>([])

    return (
        <Field
            name='productAreaId'
            render={({ form }: FieldProps<ProductTeamFormValues>) => (
                <Block marginRight='10px' width='100%'>
                    <Select
                        options={options}
                        onChange={({ value }) => {
                            setValue(value)
                            form.setFieldValue('productAreaId', value.length > 0 ? value[0].id : '')
                        }}
                        value={value}
                        placeholder="Velg ett produktområde"
                    />
                </Block>
            )}
        />
    )
}

const FieldMembers = (props: { onAdd: Function }) => {
    const [navIdent, setNavIdent] = React.useState<string>('')
    const [name, setName] = React.useState<string>('')
    const [role, setRole] = React.useState<string>('')

    const { onAdd } = props

    const resetFields = () => {
        setNavIdent('')
        setName('')
        setRole('')
    }

    return (
        <Block display="flex" justifyContent="space-between">
            <Input type="text" size={SIZE.default} value={navIdent} onChange={e => setNavIdent(e.currentTarget.value)} placeholder="Nav-Ident" />
            <Input type="text" size={SIZE.default} value={name} onChange={e => setName(e.currentTarget.value)} placeholder="Navn" />
            <Input type="text" size={SIZE.default} value={role} onChange={e => setRole(e.currentTarget.value)} placeholder="Rolle" />

            <Button tooltip="Legg til medlem" kind="minimal" onClick={() => {
                onAdd({ navIdent: navIdent, name: name, role: role } as Member)
                resetFields()
            }}>
                <FontAwesomeIcon icon={faPlus} />
            </Button>
        </Block>
    )
}

const AddedMembersList = (props: { members: Member[], onRemove: Function }) =>
    <ul>
        {props.members.map((m: Member, index: number) => (
            <ListItem
                key={index}
                sublist
                endEnhancer={() => (
                    <Button type="button" kind="minimal" onClick={() => props.onRemove(index)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                )}
            >
                <ListItemLabel><b>{m.name}</b> - {m.navIdent} - {m.role}</ListItemLabel>
            </ListItem>
        ))}

    </ul>


type ModalProductAreaProps = {
    title: string
    isOpen: boolean
    isEdit?: boolean
    initialValues: ProductTeamFormValues
    productAreaOptions: Option[],
    errorOnCreate: any | undefined
    submit: (process: ProductTeamFormValues) => void
    onClose: () => void
}

const ModalTeam = ({ submit, errorOnCreate, onClose, isOpen, initialValues, title, productAreaOptions }: ModalProductAreaProps) => {
    const [description, setDescription] = React.useState('')

    const disableEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault()
    }

    return (
        <Modal
            onClose={onClose}
            isOpen={isOpen}
            closeable={false}
            animate
            size={SIZE.auto}
            role={ROLE.dialog}
        >
            <Block {...modalBlockProps}>
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => {
                        submit(values)
                    }}
                    render={(formikBag: FormikProps<ProductTeamFormValues>) => (
                        <Form onKeyDown={disableEnter}>
                            <ModalHeader>
                                <Block {...modalHeaderProps}>
                                    {title}
                                </Block>
                            </ModalHeader>

                            <ModalBody>
                                <CustomizedModalBlock>
                                    <ModalLabel label="Navn" />
                                    <Field name="name">
                                        {(props: FieldProps) =>
                                            <Input type="text" size={SIZE.default} {...props.field} />
                                        }
                                    </Field>
                                </CustomizedModalBlock>

                                <CustomizedModalBlock>
                                    <ModalLabel label="Produktområde" />
                                    <FieldProductArea options={productAreaOptions} />
                                </CustomizedModalBlock>

                                <CustomizedModalBlock>
                                    <ModalLabel label="Nais teams" />
                                    <FieldArray
                                        name='naisTeams'
                                        render={arrayHelpers => (
                                            <Block width="100%">
                                                <FieldNaisTeam onAdd={(naisTeam: any) => arrayHelpers.push(naisTeam)} />
                                                {renderTagList(arrayHelpers.form.values.naisTeams, (index: number) => arrayHelpers.remove(index))}
                                            </Block>
                                        )}
                                    />
                                </CustomizedModalBlock>

                                <CustomizedModalBlock>
                                    <ModalLabel label="Slack kanal" />
                                    <Field name="slackChannel">
                                        {(props: FieldProps) =>
                                            <Input type="text" size={SIZE.default} {...props.field} />
                                        }
                                    </Field>
                                </CustomizedModalBlock>

                                <CustomizedModalBlock>
                                    <ModalLabel label="Beskrivelse" />
                                    <Field name="description">
                                        {(props: FieldProps) =>
                                            <Textarea
                                                value={description}
                                                onChange={event => setDescription((event.target as HTMLTextAreaElement).value)}
                                                {...props.field}
                                            />
                                        }
                                    </Field>
                                </CustomizedModalBlock>

                                <CustomizedModalBlock>
                                    <ModalLabel label="Medlemmer" />
                                    <FieldArray
                                        name='members'
                                        render={arrayHelpers => (
                                            <Block>
                                                <FieldMembers onAdd={(member: Member) => arrayHelpers.push(member)} />
                                                <AddedMembersList
                                                    members={arrayHelpers.form.values.members}
                                                    onRemove={(index: number) => arrayHelpers.remove(index)}
                                                />
                                            </Block>
                                        )}
                                    />
                                </CustomizedModalBlock>


                            </ModalBody>

                            <ModalFooter style={{ borderTop: 0 }}>
                                <Block display='flex' justifyContent='flex-end'>
                                    <Block alignSelf='flex-end'>{errorOnCreate && <p>{errorOnCreate}</p>}</Block>
                                    <Button type='button' kind={KIND.minimal} onClick={onClose}>Avbryt</Button>
                                    <ModalButton type='submit'>Lagre</ModalButton>
                                </Block>
                            </ModalFooter>
                        </Form>
                    )}
                />

            </Block>
        </Modal>
    )
}

export default ModalTeam
