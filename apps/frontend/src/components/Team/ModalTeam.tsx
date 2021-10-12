import * as React from 'react'
import { KeyboardEvent, useEffect, useState } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'
import { Field, FieldArray, FieldProps, Form, Formik, FormikProps } from 'formik'
import { Block, BlockProps } from 'baseui/block'
import { ProductTeamFormValues } from '../../constants'
import CustomizedModalBlock from '../common/CustomizedModalBlock'
import { Error, ModalLabel } from '../common/ModalSchema'
import { Input } from 'baseui/input'
import { Textarea } from 'baseui/textarea'
import Button from '../common/Button'
import { KIND } from 'baseui/button'
import FieldNaisTeam from './FieldNaisTeam'
import { RenderTagList } from '../common/TagList'
import { teamSchema } from '../common/schema'
import FieldQaTime from './FieldQaTime'
import FieldTeamType from './FieldTeamType'
import FieldProductArea from './FieldProductArea'
import FormMembersList from '../Members/FormMembersList'
import ErrorBlock from '../common/ErrorBlock'
import { StyledLink } from 'baseui/link'
import FieldTags from '../common/FieldTags'
import { ObjectType } from '../admin/audit/AuditTypes'
import { markdownLink } from '../../util/config'
import { FieldLocations } from '../common/FieldLocations'
import FieldCluster from './FieldClusters'
import { getResourceById, mapResourceToOption, mapToOptions, ResourceOption, useAllProductAreas, useResourceSearch } from '../../api'
import { useAllClusters } from '../../api/clusterApi'
import { StatefulTooltip } from 'baseui/tooltip'
import { Select } from 'baseui/select'
import { ContactAddressesEdit } from './FieldContactAddress'

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
  marginBottom: '2rem',
}

const DEFAULT_PRODUCTAREA_LABEL = 'Ikke plassert i produkt- eller IT-område'

type ModalProductAreaProps = {
  title: string
  isOpen: boolean
  initialValues: ProductTeamFormValues
  errorMessage: any | undefined
  submit: (process: ProductTeamFormValues) => void
  onClose: () => void
}

const ModalTeam = ({ submit, errorMessage, onClose, isOpen, initialValues, title }: ModalProductAreaProps) => {
  function sortItems(a: string, b: string) {
    if (a.localeCompare(b, 'no') < 0) {
      return -1
    } else if (a.localeCompare(b, 'no') > 0) {
      return 1
    }
    return 0
  }

  function sortProductAreaOption(inputArray: { id: string; label: string }[]) {
    if (inputArray.length != 0) {
      const sortedArray = inputArray.sort((a, b) => sortItems(a.label, b.label))
      const placeholderValue = sortedArray.find((element) => element.label === DEFAULT_PRODUCTAREA_LABEL)
      const indexOfPlaceholderValue = sortedArray.findIndex((element: { id: string; label: string }) => element.label === DEFAULT_PRODUCTAREA_LABEL)
      sortedArray.splice(indexOfPlaceholderValue, 1)
      sortedArray.unshift({ id: placeholderValue!.id, label: placeholderValue!.label })
      return sortedArray
    } else {
      return inputArray
    }
  }

  const productAreaOptions = sortProductAreaOption(mapToOptions(useAllProductAreas()))
  const clusterOptions = mapToOptions(useAllClusters()).sort((a, b) => sortItems(a.label, b.label))

  const disableEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
  }

  const [resource, setResource] = useState<ResourceOption[]>([])
  const [searchResult, setResourceSearch, loading] = useResourceSearch()

  useEffect(() => {
    ;(async () => {
      if (initialValues && initialValues.contactPersonIdent) {
        const contactPersonResource = await getResourceById(initialValues.contactPersonIdent)
        initialValues = { ...initialValues, contactPersonResource: contactPersonResource }
        setResource([mapResourceToOption(contactPersonResource)])
      } else {
        setResource([])
      }
    })()
  }, [isOpen])

  return (
    <Modal onClose={onClose} isOpen={isOpen} closeable={false} animate size={SIZE.auto} role={ROLE.dialog} unstable_ModalBackdropScroll={true}>
      <Block {...modalBlockProps}>
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => submit(values)}
          validationSchema={teamSchema()}
          render={(formikBag: FormikProps<ProductTeamFormValues>) => (
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
                    <ModalLabel label="Område" required={true} />
                    <FieldProductArea
                      options={productAreaOptions}
                      initialValue={initialValues.productAreaId ? productAreaOptions.filter((po) => po.id === initialValues.productAreaId) : []}
                    />
                  </Block>
                  <Error fieldName="productAreaId" />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Klynger" />
                    <FieldArray
                      name="clusterIds"
                      render={(arrayHelpers) => (
                        <Block width="100%">
                          <FieldCluster onAdd={(clusterId: any) => arrayHelpers.push(clusterId)} options={clusterOptions} values={arrayHelpers.form.values.clusterIds} />
                          <RenderTagList
                            list={arrayHelpers.form.values.clusterIds.map((id: string) => clusterOptions.find((c) => c.id === id)?.label || id)}
                            onRemove={(index: number) => arrayHelpers.remove(index)}
                          />
                        </Block>
                      )}
                    />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="NAIS team" />
                    <FieldArray
                      name="naisTeams"
                      render={(arrayHelpers) => (
                        <Block width="100%">
                          <FieldNaisTeam onAdd={(naisTeam: any) => arrayHelpers.push(naisTeam)} values={arrayHelpers.form.values.naisTeams} />
                          <RenderTagList list={arrayHelpers.form.values.naisTeams} onRemove={(index: number) => arrayHelpers.remove(index)} />
                        </Block>
                      )}
                    />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Slack-kanal" />
                    <Field name="slackChannel">{(props: FieldProps) => <Input type="text" size={SIZE.default} {...props.field} value={props.field.value || ''} />}</Field>
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Kontaktperson" />
                    <Select
                      options={!loading ? searchResult : []}
                      filterOptions={(options) => options}
                      maxDropdownHeight="400px"
                      onChange={({ value }) => {
                        if (value && value[0]) {
                          setResource(value as ResourceOption[])
                          formikBag.setFieldValue('contactPersonIdent', value[0].navIdent)
                        } else {
                          setResource([])
                          formikBag.setFieldValue('contactPersonIdent', '')
                        }
                      }}
                      onInputChange={async (event) => setResourceSearch(event.currentTarget.value)}
                      value={resource}
                      isLoading={loading}
                      placeholder="Søk etter personen som fungerer som teamets kontaktperson"
                    />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Kontaktadresser" tooltip={'Kun synlig for teammedlemmene, brukes av løsningen for å sende automatiske varsler'} />
                    <ContactAddressesEdit />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel
                      label="Beskrivelse"
                      required={true}
                      subText={
                        <Block display="flex" flexDirection="column">
                          <Block>
                            Støtter{' '}
                            <StyledLink href={markdownLink} target="_blank" rel="noopener noreferrer">
                              Markdown
                            </StyledLink>
                          </Block>
                          <Block>(shift+enter for linjeshift)</Block>
                        </Block>
                      }
                    />
                    <Field name="description">
                      {(props: FieldProps) => (
                        <Textarea rows={10} {...props.field} placeholder={'Gi en kort beskrivelse av hva teamet gjør. Gjerne list også opp systemene teamet har ansvar for'} />
                      )}
                    </Field>
                  </Block>
                  <Error fieldName="description" />
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Teamtype" />
                    <FieldTeamType teamType={formikBag.values.teamType} />
                  </Block>
                  <Error fieldName="teamType" />
                </CustomizedModalBlock>

                {/*feature toggle ;) */}
                {formikBag.values.tags.indexOf('locationspoc') === 0 && (
                  <CustomizedModalBlock>
                    <Block {...rowBlockProps}>
                      <FieldArray name="locations" render={(arrayHelper) => <FieldLocations arrayHelper={arrayHelper} locations={formikBag.values.locations} />} />
                    </Block>
                    {formikBag.values.locations.map((l, i) => (
                      <Error key={i} fieldName={`locations[${i}]`} />
                    ))}
                  </CustomizedModalBlock>
                )}

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Tagg" />
                    <FieldTags />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <FieldQaTime qaTime={formikBag.values.qaTime} />
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Medlemmer" />
                    <FieldArray
                      name="members"
                      render={(arrayHelpers) => (
                        <FormMembersList arrayHelpers={arrayHelpers} type={ObjectType.Team} naisTeams={formikBag.values.naisTeams} formikBag={formikBag as any} />
                      )}
                    />
                  </Block>
                </CustomizedModalBlock>
              </ModalBody>

              <ModalFooter style={{ borderTop: 0 }}>
                {errorMessage && <ErrorBlock errorMessage={errorMessage} />}
                <Block display="flex" justifyContent="flex-end">
                  <Button type="button" kind={KIND.minimal} onClick={onClose}>
                    Avbryt
                  </Button>
                  <StatefulTooltip focusLock={false} content={() => (formikBag.isValid ? null : JSON.stringify(formikBag.errors))} onMouseEnterDelay={3000}>
                    <ModalButton type="submit">Lagre</ModalButton>
                  </StatefulTooltip>
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
