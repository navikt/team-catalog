import * as React from 'react'
import {KeyboardEvent} from 'react'
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE} from 'baseui/modal'
import {Field, FieldArray, FieldProps, Form, Formik, FormikProps,} from 'formik'
import {Block, BlockProps} from 'baseui/block'
import {Member, ProductTeamFormValues} from '../../constants'
import CustomizedModalBlock from '../common/CustomizedModalBlock'
import {Error, ModalLabel} from '../common/ModalSchema'
import {Input} from 'baseui/input'
import {Textarea} from 'baseui/textarea'
import Button from '../common/Button'
import {KIND} from 'baseui/button'
import {Option, Value} from 'baseui/select'
import FieldNaisTeam from './FieldNaisTeam'
import {renderTagList} from '../common/TagList'
import {teamSchema} from '../common/schema'
import FormAddMember from './FormAddMember'
import TeamLeader from "./TeamLeader";
import TeamLeaderQA from "./TeamLeaderQA";
import FieldTeamType from "./FieldTeamType";
import FieldProductArea from "./FieldProductArea";
import AddedMembersList from "./AddedMemberList";
import ErrorBlock from "../common/ErrorBlock";


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

type ModalProductAreaProps = {
  title: string
  isOpen: boolean
  initialValues: ProductTeamFormValues
  productAreaOptions: Option[],
  errorMessage: any | undefined
  submit: (process: ProductTeamFormValues) => void
  onClose: () => void
}

const ModalTeam = ({submit, errorMessage, onClose, isOpen, initialValues, title, productAreaOptions}: ModalProductAreaProps) => {
  const [description, setDescription] = React.useState('')
  const [teamLeader, setTeamLeader] = React.useState<Value>([])

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
          onSubmit={(values) => submit(values)}
          validationSchema={teamSchema()}
          render={(formikBag: FormikProps<ProductTeamFormValues>) => (
            <Form onKeyDown={disableEnter}>
              <ModalHeader>
                <Block {...modalHeaderProps}>
                  {title}
                </Block>
              </ModalHeader>

              <ModalBody>
                <CustomizedModalBlock>
                  <ModalLabel label='Navn'/>
                  <Field name='name'>
                    {(props: FieldProps) =>
                      <Input type='text' size={SIZE.default} {...props.field} />
                    }
                  </Field>
                </CustomizedModalBlock>
                <Error fieldName='name'/>

                <CustomizedModalBlock>
                  <ModalLabel label='Produktområde'/>
                  <FieldProductArea
                    options={productAreaOptions}
                    initialValue={
                      initialValues.productAreaId ? productAreaOptions.filter(po => po.id === initialValues.productAreaId) : []
                    }
                  />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <ModalLabel label='NAIS teams'/>
                  <FieldArray
                    name='naisTeams'
                    render={arrayHelpers => (
                      <Block width='100%'>
                        <FieldNaisTeam onAdd={(naisTeam: any) => arrayHelpers.push(naisTeam)}/>
                        {renderTagList(arrayHelpers.form.values.naisTeams, (index: number) => arrayHelpers.remove(index))}
                      </Block>
                    )}
                  />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <ModalLabel label='Slack kanal'/>
                  <Field name='slackChannel'>
                    {(props: FieldProps) =>
                      <Input type='text' size={SIZE.default} {...props.field} value={props.field.value || ''}/>
                    }
                  </Field>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <ModalLabel label='Beskrivelse'/>
                  <Field name='description'>
                    {(props: FieldProps) =>
                      <Textarea
                        value={description}
                        onChange={event => setDescription((event.target as HTMLTextAreaElement).value)}
                        {...props.field}
                      />
                    }
                  </Field>
                </CustomizedModalBlock>
                <Error fieldName='description'/>

                <CustomizedModalBlock>
                  <ModalLabel label='Teamtype'/>
                  <FieldTeamType teamType={formikBag.values.teamType}/>
                </CustomizedModalBlock>
                <Error fieldName='teamType'/>

                <CustomizedModalBlock>
                  <TeamLeaderQA teamLeadQA={formikBag.values.teamLeadQA}/>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <TeamLeader teamLeaderId={formikBag.values.teamLeader} teamLeader={teamLeader} setTeamLeader={setTeamLeader}/>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <ModalLabel label='Medlemmer'/>
                  <FieldArray
                    name='members'
                    render={arrayHelpers => (
                      <Block width='100%'>
                        <FormAddMember submit={(member: Member) => arrayHelpers.push(member)}/>
                        <AddedMembersList
                          members={arrayHelpers.form.values.members}
                          onRemove={(index: number) => {
                            arrayHelpers.remove(index)
                            if (formikBag.values.teamLeader === arrayHelpers.form.values.members[index].navIdent) {
                              formikBag.setFieldValue('teamLeader', '');
                              setTeamLeader([]);
                            }
                          }}
                        />
                      </Block>
                    )}
                  />
                </CustomizedModalBlock>
              </ModalBody>

              <ModalFooter style={{borderTop: 0}}>
                {errorMessage && <ErrorBlock errorMessage={errorMessage}/>}
                <Block display='flex' justifyContent='flex-end'>
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
