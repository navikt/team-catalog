import * as React from 'react'
import {KeyboardEvent} from 'react'
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE} from 'baseui/modal'
import {Field, FieldArray, FieldProps, Form, Formik, FormikProps,} from 'formik'
import {Block, BlockProps} from 'baseui/block'
import {ProductTeamFormValues} from '../../constants'
import CustomizedModalBlock from '../common/CustomizedModalBlock'
import {Error, ModalLabel} from '../common/ModalSchema'
import {Input} from 'baseui/input'
import {Textarea} from 'baseui/textarea'
import Button from '../common/Button'
import {KIND} from 'baseui/button'
import {Option} from 'baseui/select'
import FieldNaisTeam from './FieldNaisTeam'
import {renderTagList} from '../common/TagList'
import {teamSchema} from '../common/schema'
import FieldTeamLeaderQA from "./FieldTeamLeaderQA";
import FieldTeamType from "./FieldTeamType";
import FieldProductArea from "./FieldProductArea";
import FormMembersList from "../Members/FormMembersList";
import ErrorBlock from "../common/ErrorBlock";
import {StyledLink} from 'baseui/link'
import FieldTags from "../common/FieldTags";
import {ObjectType} from '../admin/audit/AuditTypes'
import {markdownLink} from '../../util/config'
import {FieldLocations} from '../common/FieldLocations'

const modalBlockProps: BlockProps = {
  width: '900px',
  paddingRight: '2rem',
  paddingLeft: '2rem',
}

const rowBlockProps: BlockProps = {
  display: 'flex',
  width: '100%',
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

  const disableEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
  }

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      closeable={false}
      animate
      size={SIZE.auto}
      role={ROLE.dialog}
      unstable_ModalBackdropScroll={true}
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
                  <Block {...rowBlockProps}>
                    <ModalLabel label='Navn' required={true}/>
                    <Field name='name'>
                      {(props: FieldProps) =>
                        <Input type='text' size={SIZE.default} {...props.field} />
                      }
                    </Field>
                  </Block>
                  <Error fieldName='name'/>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label='Område'/>
                    <FieldProductArea
                      options={productAreaOptions}
                      initialValue={
                        initialValues.productAreaId ? productAreaOptions.filter(po => po.id === initialValues.productAreaId) : []
                      }
                    />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
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
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label='Slack kanal'/>
                    <Field name='slackChannel'>
                      {(props: FieldProps) =>
                        <Input type='text' size={SIZE.default} {...props.field} value={props.field.value || ''}/>
                      }
                    </Field>
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label='Beskrivelse' required={true} subText={
                      <Block display='flex' flexDirection='column'>
                        <Block>Støtter <StyledLink
                          href={markdownLink}
                          target="_blank" rel="noopener noreferrer"
                        >Markdown</StyledLink></Block>
                        <Block>(shift+enter for linjeshift)</Block>
                      </Block>
                    }/>
                    <Field name='description'>
                      {(props: FieldProps) =>
                        <Textarea
                          rows={10}
                          {...props.field}
                          placeholder={"Gi en kort beskrivelse av hva teamet gjør. Gjerne list også opp systemene teamet har ansvar for"}
                        />
                      }
                    </Field>
                  </Block>
                  <Error fieldName='description'/>
                </CustomizedModalBlock>


                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label='Teamtype'/>
                    <FieldTeamType teamType={formikBag.values.teamType}/>
                  </Block>
                  <Error fieldName='teamType'/>
                </CustomizedModalBlock>

                {/*feature toggle ;) */}
                {formikBag.values.tags.indexOf('locationspoc') === 0 &&
                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <FieldArray
                      name='locations'
                      render={arrayHelper =>
                        <FieldLocations arrayHelper={arrayHelper} locations={formikBag.values.locations}/>
                      }
                    />
                  </Block>
                  {formikBag.values.locations.map((l, i) =>
                    <Error key={i} fieldName={`locations[${i}]`}/>
                  )}
                </CustomizedModalBlock>}

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label='Tagg'/>
                    <FieldTags/>
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <FieldTeamLeaderQA teamLeadQA={formikBag.values.teamLeadQA}/>
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label='Medlemmer'/>
                    <FieldArray
                      name='members'
                      render={arrayHelpers =>
                        <FormMembersList arrayHelpers={arrayHelpers}
                                         type={ObjectType.Team}
                                         naisTeams={formikBag.values.naisTeams}
                                         formikBag={formikBag as any}
                        />}
                    />
                  </Block>
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
