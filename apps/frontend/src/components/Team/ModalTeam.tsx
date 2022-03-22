import * as React from 'react'
import { KeyboardEvent, useEffect, useState } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from 'baseui/modal'
import { Field, FieldArray, FieldProps, Form, Formik, FormikProps } from 'formik'
import { Block, BlockProps } from 'baseui/block'
import { LocationHierarchy, LocationSimple, ProductArea, ProductTeamFormValues } from '../../constants'
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
import { Option, Select, Value } from 'baseui/select'
import { ContactAddressesEdit } from './FieldContactAddress'
import { getLocationHierarchy, mapLocationsToOptions } from '../../api/location'
import { Checkbox, LABEL_PLACEMENT } from 'baseui/checkbox'
import { findIndex } from 'lodash'
import { Label2 } from 'baseui/typography'
import { getDisplayDay } from './TeamMetadata'
import { sortedProductAreaOptions } from '../cluster/ModalCluster'
import FieldStatus from '../common/FieldStatus'

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

export const WEEKDAYS = [ 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

export function sortItems(a: string, b: string) {
  if (a.localeCompare(b, 'no') < 0) {
    return -1
  } else if (a.localeCompare(b, 'no') > 0) {
    return 1
  }
  return 0
}

export function sortProductAreaOption(inputArray: { id: string; label: string }[]) {
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

function checkAreaIsDefault(allAreas: ProductArea[], areaToTestId: string): boolean {
  const areaObj = allAreas.find(it => it.id === areaToTestId)
  return !!areaObj && areaObj.defaultArea
}

type ModalProductAreaProps = {
  title: string
  isOpen: boolean
  initialValues: ProductTeamFormValues
  errorMessage: any | undefined
  submit: (process: ProductTeamFormValues) => void
  onClose: () => void
}

const ModalTeam = ({ submit, errorMessage, onClose, isOpen, initialValues, title }: ModalProductAreaProps) => {

  const productAreas = useAllProductAreas()
  const productAreaOptions = mapToOptions(productAreas)
  const clusterOptions = mapToOptions(useAllClusters()).sort((a, b) => sortItems(a.label, b.label))

  const disableEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
  }

  const [resource, setResource] = useState<ResourceOption[]>([])
  const [searchResult, setResourceSearch, loading] = useResourceSearch()
  const [resourceTeamOwner, setResourceTeamOwner] = useState<ResourceOption[]>([])
  const [selectedAreaValue, setSelectedAreaValue] = useState<Value | undefined>()
  const [checkboxes, setCheckboxes] = React.useState<boolean[]>([]);
  const [locationHierarchy, setLocationHierarchy] = React.useState<LocationHierarchy[]>([])
  const [selectedLocationSection, setSelectedLocationSection] = React.useState<Value>([])
  const [selectedLocationFloor, setSelectedLocationFloor] = React.useState<Value>([])

  const selectedAreaIsTheDefault = checkAreaIsDefault(productAreas, selectedAreaValue && selectedAreaValue[0] ? selectedAreaValue[0]?.id as string : "")
  const showTeamOwner = selectedAreaIsTheDefault || resourceTeamOwner.length !== 0;

  const getSectionOptions = () => {
      if (!locationHierarchy) return []

      if (locationHierarchy.length > 0) {
        return mapLocationsToOptions(locationHierarchy[0].subLocations)
      }
  }

  const getFloorOptions = () => {
      if (!selectedLocationSection) return []
      if (selectedLocationSection.length > 0) {
          const currentFloors = locationHierarchy[0].subLocations.filter((sl) => sl.code === selectedLocationSection[0].id)
          const currentFloorsToOptions = currentFloors.length > 0 ? currentFloors[0].subLocations.map((fl) => ({id: fl.code, label: fl.description})) : []
          return currentFloorsToOptions
      } else return []
  }

  useEffect(() => {
    ; (async () => {
      const resLocationHierarchy = await getLocationHierarchy()
      if (resLocationHierarchy) 
        setLocationHierarchy(resLocationHierarchy)

      if (initialValues) {
        if (initialValues.officeHours) {
          setCheckboxes(WEEKDAYS.map(wd => initialValues.officeHours?.days?.includes(wd) ? true : false))
            setSelectedLocationSection([{id: initialValues.officeHours.location?.parent?.code, label: initialValues.officeHours.location?.parent?.displayName}])
            setSelectedLocationFloor([{id: initialValues.officeHours.locationCode, label: initialValues.officeHours.location?.description}])
        }

        if (initialValues.contactPersonIdent) {
          const contactPersonResource = await getResourceById(initialValues.contactPersonIdent)
          initialValues = { ...initialValues, contactPersonResource: contactPersonResource }
          setResource([mapResourceToOption(contactPersonResource)]) 
        }
        else {
          setResource([])
        }

        if (initialValues.teamOwnerIdent) {
          const teamOwnerResource = await getResourceById(initialValues.teamOwnerIdent)
          initialValues = { ...initialValues, teamOwnerResource: teamOwnerResource }
          setResourceTeamOwner([mapResourceToOption(teamOwnerResource)])
        } else {
          setResourceTeamOwner([])
        }
      }
    })()
  }, [isOpen])

  return (
    <Modal onClose={onClose} isOpen={isOpen} closeable={false} animate size={SIZE.auto} role={ROLE.dialog} unstable_ModalBackdropScroll={true}>
      <Block {...modalBlockProps}>
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {submit(values)}}
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
                      options={sortedProductAreaOptions(productAreaOptions)}
                      selectCallback={(v: Value) => {
                        const isDefault = checkAreaIsDefault(productAreas, (v[0] && v[0].id) + "" || "")
                        if (!isDefault) {
                          formikBag.setFieldValue("teamOwnerIdent", undefined)
                          setResourceTeamOwner([])
                        }
                        setSelectedAreaValue(v)
                      }}
                      initialValue={initialValues.productAreaId ? productAreaOptions.filter((po) => po.id === initialValues.productAreaId) : []}
                    />
                  </Block>
                  <Error fieldName="productAreaId" />
                </CustomizedModalBlock>

                {showTeamOwner && (
                  <CustomizedModalBlock>
                    <Block {...rowBlockProps}>
                      <ModalLabel label="Teameier" />
                      <Select
                        options={!loading ? searchResult : []}
                        filterOptions={(options) => options}
                        maxDropdownHeight="400px"
                        onChange={({ value }) => {
                          if (value && value[0]) {
                            setResourceTeamOwner(value as ResourceOption[])
                            formikBag.setFieldValue('teamOwnerIdent', value[0].navIdent)
                          } else {
                            setResourceTeamOwner([])
                            formikBag.setFieldValue('teamOwnerIdent', undefined)
                          }
                        }}
                        onInputChange={async (event) => setResourceSearch(event.currentTarget.value)}
                        value={resourceTeamOwner}
                        isLoading={loading}
                        placeholder="Søk etter personen som fungerer som teamets eier"
                      />
                    </Block>
                  </CustomizedModalBlock>
                )}

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Klynger" />
                    <FieldArray
                      name="clusterIds"
                      render={(arrayHelpers) => (
                        <Block width="100%">
                          <FieldCluster onAdd={(clusterId: any) => arrayHelpers.push(clusterId)} options={clusterOptions} values={arrayHelpers.form.values.clusterIds} />
                          <RenderTagList
                            list={arrayHelpers.form.values.clusterIds.map((id : string) => clusterOptions.find((c) => c.id === id)?.label || id)}
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
                          
                          <RenderTagList list={arrayHelpers.form.values.naisTeams} onRemove={(index: number) => arrayHelpers.remove(index)} disabled={true}/>
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
                    <ModalLabel label="Status" required />
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
                    <ModalLabel label="Lokasjon" />
                    <Block display="flex" width="100%">
                      <Select
                        options={getSectionOptions()}
                        maxDropdownHeight="350px"
                        onChange={({ value }) => {
                          setSelectedLocationSection(value.length > 0 ? value : [])
                          if (value.length > 0) {
                            setSelectedLocationSection(value)
                          } else {
                            setSelectedLocationSection([])
                            setSelectedLocationFloor([])
                            setCheckboxes([])
                            formikBag.setFieldValue('officeHours', undefined)
                          }
                        }}
                        value={selectedLocationSection}
                        isLoading={loading}
                        placeholder="Søk og legg til sted"
                      />
                      
                      <Select
                        options={selectedLocationSection.length > 0 ? getFloorOptions() : []}
                        disabled={selectedLocationSection.length < 1}
                        maxDropdownHeight="350px"
                        onChange={({ value }) => {
                          setSelectedLocationFloor(value.length > 0 ? value : [])
                          formikBag.setFieldValue('officeHours.locationCode', value.length > 0 ? value[0].id : undefined)
                        }}
                        value={selectedLocationFloor}
                        isLoading={loading}
                        placeholder="Velg etasje"
                      />
                    </Block>
                    
                  </Block>
                </CustomizedModalBlock>

                <CustomizedModalBlock>
                  <Block {...rowBlockProps}>
                    <ModalLabel label="Kontordager" />
                    <Block width="100%">
                      <FieldArray
                        name="officeHours.days"
                        render={(arrayHelpers) => (
                          <Block display="flex">
                            {WEEKDAYS.map((day, i) => (
                              <Checkbox
                                checked={checkboxes[i]}
                                disabled={selectedLocationSection.length < 1}
                                labelPlacement={LABEL_PLACEMENT.top}
                                overrides={{Root: {style: {marginRight: '35px'}}}}
                                onChange={e => {
                                    const nextCheckboxes = [...checkboxes]
                                    nextCheckboxes[i] = e.currentTarget.checked
                                    setCheckboxes(nextCheckboxes)
                                    if (!formikBag.values.officeHours?.locationCode){
                                      formikBag.setFieldValue('officeHours.days', undefined)
                                    }
                                    else if (e.currentTarget.checked) {
                                      arrayHelpers.push(day)
                                    } else {
                                      arrayHelpers.remove(findIndex(arrayHelpers.form.values.officeHours.days, d => d === day))
                                    }
                                }}
                              >
                                {getDisplayDay(day)}
                              </Checkbox>
                            ))}
                          </Block>
                        )}
                      />
                      <Block marginTop="10px" display="flex">
                        <Label2 font="font300" display="flex" alignItems="center" marginRight="20px">kommentar</Label2>
                        <Field name="officeHours.information" >
                          {(props: FieldProps) =>
                            <Input
                              disabled={selectedLocationSection.length < 1}
                              type="text"
                              size={SIZE.default}
                              {...props.field}
                              value={props.field.value || ''}
                              placeholder="Evt. kommentarer rundt tilstedeværelse på kontoret"
                            />
                          }
                        </Field>
                      </Block>

                    </Block>
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
