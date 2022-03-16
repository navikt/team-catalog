import React, { KeyboardEvent } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'
import { Field, FieldArray, FieldProps, Form, Formik, FormikProps } from 'formik'
import { Block, BlockProps } from 'baseui/block'
import { AreaType, ProductAreaFormValues } from '../../constants'
import CustomizedModalBlock from '../common/CustomizedModalBlock'
import {CustomNotification, Error, ModalLabel} from '../common/ModalSchema'
import {Input} from 'baseui/input'
import {Textarea} from 'baseui/textarea'
import Button from '../common/Button'
import {KIND} from 'baseui/button'
import {productAreaSchema} from '../common/schema'
import {StyledLink} from 'baseui/link'
import FieldTags from "../common/FieldTags";
import FormMembersList from '../Members/FormMembersList'
import {ObjectType} from '../admin/audit/AuditTypes'
import {markdownLink} from '../../util/config'
import FieldAreaType from './FieldAreaType'
import FormEditOwner from './FormEditOwner'
import ErrorBlock from '../common/ErrorBlock'
import FieldStatus from '../common/FieldStatus'

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

type ModalProductAreaProps = {
  title: string;
  isOpen: boolean;
  isEdit?: boolean;
  initialValues: ProductAreaFormValues;
  errorOnCreate: any | undefined;
  submit: (process: ProductAreaFormValues) => void;
  onClose: () => void;
};

const ModalProductArea = ({ submit, errorOnCreate, onClose, isOpen, initialValues, title }: ModalProductAreaProps) => {
  const disableEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} closeable={false} animate size={SIZE.auto} role={ROLE.dialog}>
      <Block {...modalBlockProps}>
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            console.log(values)
            submit(values);
          }}
          validationSchema={productAreaSchema()}
        >
          {(formikBag: FormikProps<ProductAreaFormValues>) => (
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
                    <ModalLabel label="Områdetype" />
                    <FieldAreaType areaType={formikBag.values.areaType} />
                  </Block>
                  <Error fieldName="areaType" />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Slack kanal" />
                    <Field name="slackChannel">{(props: FieldProps) => <Input type="text" size={SIZE.default} {...props.field} value={props.field.value || ""} />}</Field>
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Status" />
                    <FieldStatus status={formikBag.values.status} />
                  </Block>
                  <Error fieldName="status" />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel
                      label="Beskrivelse"
                      required={true}
                      subText={
                        <span>
                          Støtter{" "}
                          <StyledLink href={markdownLink} target="_blank" rel="noopener noreferrer">
                            Markdown
                          </StyledLink>
                        </span>
                      }
                    />
                    <Field name="description">{(props: FieldProps) => <Textarea rows={10} {...props.field} placeholder={"Gi en kort beskrivelse av hva området"} />}</Field>
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
                    <ModalLabel label="Medlemmer" />
                    <FieldArray
                      name="members"
                      render={(arrayHelpers: any) => <FormMembersList arrayHelpers={arrayHelpers} type={ObjectType.ProductArea} formikBag={formikBag as any} />}
                    />
                  </Block>
                </CustomizedModalBlock>

                {formikBag.values.areaType === AreaType.PRODUCT_AREA && (
                  <CustomizedModalBlock>
                    <Block {...rowBlockProps}>
                      <ModalLabel label="Eiere" />
                      <Block width="100%">
                        <FormEditOwner />
                        {(formikBag.values.ownerGroup && formikBag.touched.ownerGroup && formikBag.errors.ownerGroup ) && (
                          <CustomNotification message={"Eiergruppen må enten være helt tom eller ha en leder"} />
                        )}
                      </Block>
                    </Block>
                  </CustomizedModalBlock>
                )}
              </ModalBody>

              <ModalFooter style={{ borderTop: 0 }}>
              <Block alignSelf="flex-end">{errorOnCreate &&  <ErrorBlock errorMessage={errorOnCreate} />}</Block>
                <Block display="flex" justifyContent="flex-end">
                  <Button type="button" kind={KIND.minimal} onClick={onClose}>
                    Avbryt
                  </Button>
                  <ModalButton
                    type="submit"
                    onClick={() => {
                      if (formikBag.errors && Object.keys(formikBag.errors).length !== 0) {
                        console.error({ formikErrors: formikBag.errors, formikValues: formikBag.values });
                      }
                    }}
                  >
                    Lagre
                  </ModalButton>
                </Block>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Block>
      {}
    </Modal>
  );
}

export default ModalProductArea
