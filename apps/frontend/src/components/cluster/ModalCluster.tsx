import * as React from 'react'
import { KeyboardEvent } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'
import { Field, FieldArray, FieldProps, Form, Formik, FormikProps } from 'formik'
import { Block, BlockProps } from 'baseui/block'
import { ClusterFormValues } from '../../constants'
import CustomizedModalBlock from '../common/CustomizedModalBlock'
import { Error, ModalLabel } from '../common/ModalSchema'
import { Input } from 'baseui/input'
import { Textarea } from 'baseui/textarea'
import Button from '../common/Button'
import { KIND } from 'baseui/button'
import { clusterSchema } from '../common/schema'
import { StyledLink } from 'baseui/link'
import FieldTags from '../common/FieldTags'
import { markdownLink } from '../../util/config'
import FormMembersList from '../Members/FormMembersList'
import { ObjectType } from '../admin/audit/AuditTypes'
import FieldProductArea from '../Team/FieldProductArea'
import { mapToOptions, useAllProductAreas } from '../../api'
import ErrorBlock from '../common/ErrorBlock'
import { sortItems, sortProductAreaOption } from '../Team/ModalTeam'

const modalBlockProps: BlockProps = {
  width: '700px',
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
  marginBottom: '2rem',
}

type ModalClusterProps = {
  title: string
  isOpen: boolean
  isEdit?: boolean
  initialValues: ClusterFormValues
  errorOnCreate: any | undefined
  submit: (process: ClusterFormValues) => void
  onClose: () => void
}

export const sortedProductAreaOptions = (productAreaOptions: { id: string; label: string }[]) => 
    productAreaOptions.sort((a, b) => sortItems(a.label, b.label))

const ModalCluster = ({ submit, errorOnCreate, onClose, isOpen, initialValues, title }: ModalClusterProps) => {
  const productAreaOptions = mapToOptions(useAllProductAreas())

  const disableEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} closeable={false} animate size={SIZE.auto} role={ROLE.dialog}>
      <Block {...modalBlockProps}>
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            submit(values)
          }}
          validationSchema={clusterSchema()}
          render={(formikBag: FormikProps<ClusterFormValues>) => (
            <Form onKeyDown={disableEnter}>
              <ModalHeader>
                <Block {...modalHeaderProps}>{title}</Block>
              </ModalHeader>

              <ModalBody>
                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Navn" required={true} />
                    <Field name="name">{(props: FieldProps) => <Input type="text" size={SIZE.default} {...props.field} />}</Field>
                  </Block>

                  <Error fieldName="name" />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Slack kanal" />
                    <Field name="slackChannel">{(props: FieldProps) => <Input type="text" size={SIZE.default} {...props.field} value={props.field.value || ''} />}</Field>
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel
                      label="Beskrivelse"
                      required={true}
                      subText={
                        <span>
                          Støtter{' '}
                          <StyledLink href={markdownLink} target="_blank" rel="noopener noreferrer">
                            Markdown
                          </StyledLink>
                        </span>
                      }
                    />
                    <Field name="description">{(props: FieldProps) => <Textarea rows={10} {...props.field} placeholder={'Gi en kort beskrivelse av hva området'} />}</Field>
                  </Block>
                  <Error fieldName="description" />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Tagg" />
                    <FieldTags />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Område" />
                    <FieldProductArea
                      options={sortedProductAreaOptions(productAreaOptions)}
                      initialValue={initialValues.productAreaId ? productAreaOptions.filter((po) => po.id === initialValues.productAreaId) : []}
                    />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Medlemmer" />
                    <FieldArray name="members" render={(arrayHelpers) => <FormMembersList arrayHelpers={arrayHelpers} type={ObjectType.Cluster} formikBag={formikBag as any} />} />
                  </Block>
                </CustomizedModalBlock>
              </ModalBody>

              <ModalFooter style={{ borderTop: 0 }}>
                <Block alignSelf="flex-end">{errorOnCreate && <ErrorBlock errorMessage={errorOnCreate} />}</Block>
                <Block display="flex" justifyContent="flex-end">
                  <Button type="button" kind={KIND.minimal} onClick={onClose}>
                    Avbryt
                  </Button>
                  <ModalButton type="submit">Lagre</ModalButton>
                </Block>
              </ModalFooter>
            </Form>
          )}
        />
      </Block>
    </Modal>
  )
}

export default ModalCluster
