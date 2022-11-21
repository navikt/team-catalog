import { css } from "@emotion/css"
import { Controller, useForm } from "react-hook-form";
import { BodyLong, BodyShort, Button, Checkbox, Detail, Heading, Label, Modal, Search, Textarea, TextField } from "@navikt/ds-react"
import { AddressType, LocationHierarchy, ProductTeamFormValues, Status, TeamOwnershipType, TeamType } from "../../constants";
import { getResourceById, mapResourceToOption, mapToOptions, useAllNaisTeams, useAllProductAreas, useResourceSearch, useTagSearch } from "../../api";
import { useAllClusters } from "../../hooks/useAllClusters";

import React, { useEffect } from "react";
import Select, { StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { intl } from '../../util/intl/intl'
import { InformationColored } from "@navikt/ds-icons";
import { getLocationHierarchy, mapLocationsToOptions } from "../../api/location";
import { useSlackChannelSearch } from "../../api/ContactAddressApi";

  
const styles = {
    modalStyles: css`
        width: 850px;
        min-height: 400px;
        padding: 1rem;
    `,
    boxStyles: css`
        background: #E6F1F8;
        border: 1px solid #236B7D;
        border-radius: 5px;
        min-height: 40px;
        margin-top: 1rem;
        padding: 2rem;
        width: 100;
    `,
    row: css`
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        width: 100%;
        margin-bottom: 1rem;
    `,
    buttonSection: css`
        border-top: 1px solid #CFCFCF;
        margin-top: 2rem;
        width: 100;
        display: flex;
        gap: 1rem;
        padding-top: 1rem;
        position: sticky;
    `
}

const customStyles: StylesConfig = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: '1px dotted pink',
      color: "var(--navds-global-color-gray-900)",
      padding: 10,
      backgroundColor: state.isSelected ? "var(--navds-global-color-gray-100)" : "#FFFFFF"      
    }),
    input: (provided, state) => ({
        ...provided,
        height: "40px",
        width: "40px"
    }),
    control: (provided, state) => ({
        ...provided,
        border: state.isFocused ? "1px solid var(--navds-text-field-color-border)" : "1px solid var(--navds-text-field-color-border)",
        boxShadow: state.isFocused ? "var(--navds-shadow-focus)" : undefined,
        marginTop: "0.5rem",
    }),
    menu: (provided, state) => ({
        ...provided,
    }),

}

export const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
export const getDisplayDay = (day: string) => {
    switch (day) {
      case 'MONDAY':
        return 'Mandag'
      case 'TUESDAY':
        return 'Tirsdag'
      case 'WEDNESDAY':
        return 'Onsdag'
      case 'THURSDAY':
        return 'Torsdag'
      case 'FRIDAY':
        return 'Fredag'
      default:
        break
    }
}

export const sortedProductAreaOptions = (productAreaOptions: { value: string; label: string }[]) =>
  productAreaOptions.sort((a, b) => sortItems(a.label.toLowerCase(), b.label.toLowerCase()))
  
export function sortItems(a: string, b: string) {
    if (a.localeCompare(b, 'no') < 0) {
      return -1
    } else if (a.localeCompare(b, 'no') > 0) {
      return 1
    }
    return 0
}

function checkAreaIsDefault(allAreas: ProductArea[], areaToTestId: string): boolean {
    const areaObj = allAreas.find((it) => it.id === areaToTestId)
    return !!areaObj && areaObj.defaultArea
}


type OptionType = {
    value?: string
    label?: string
}

type ModalTeamProps = {
    onClose: () => void
    title: string
    initialValues: ProductTeamFormValues
    isOpen: boolean
    onSubmitForm: (values: ProductTeamFormValues) => void
}

const ModalTeam = (props: ModalTeamProps) => {
    const { onClose, title, initialValues, isOpen, onSubmitForm } = props
    

    const [locationHierarchy, setLocationHierarchy] = React.useState<LocationHierarchy[]>([])
    const [selectedLocationSection, setSelectedLocationSection] = React.useState<OptionType>()
    const [selectedLocationFloor, setSelectedLocationFloor] = React.useState<OptionType>()
    const [officeHoursComment, setOfficeHoursComment] = React.useState<string>()
    const [checkboxes, setCheckboxes] = React.useState<boolean[]>([false, false, false, false, false])
    const [showTeamOwner, setShowTeamOwner] = React.useState<boolean>(false)

    const productAreas = useAllProductAreas()
    const [teamSearchResult, setTeamSearch, teamSearchLoading] = useTagSearch()
    const [searchResult, setResourceSearch, loading] = useResourceSearch()
    const [slackChannelSearch, setSlackChannelSearch, loadingSlackChannel] = useSlackChannelSearch()
    
    const statusOptions = Object.values(Status).map((st) => ({ value: Object.keys(Status)[Object.values(Status).indexOf(st as Status)], label: intl[st] }))
    const clusterOptions = mapToOptions(useAllClusters()).sort((a, b) => sortItems(a.label, b.label))
    const teamOwnershipTypeOptions = Object.values(TeamOwnershipType).map(tt => ({value: tt, label: intl.getString(tt + "_DESCRIPTION")}))
    const teamTypeOptions = Object.values(TeamType).map((tt) => ({ value: tt, label: intl.getString(tt + '_DESCRIPTION') }))

    const { register, control,  handleSubmit, watch, formState: { errors, isValid }} = useForm<ProductTeamFormValues>({
        defaultValues: {
            ...initialValues, 
            tags: initialValues.tags.map(t => ({ value: t, label: t})),
        }
    })

    const checkIfDefaultArea = (selectedArea: string) => {
        console.log(selectedArea, "Selected")   
        const areaObj = productAreas.find((it) => it.id === selectedArea)

        return !!areaObj && areaObj.defaultArea
    }


    const getSectionOptions = () => {
        if (!locationHierarchy) return []
    
        if (locationHierarchy.length > 0) {
          return mapLocationsToOptions(locationHierarchy[0].subLocations)
        }
    }

    const getFloorOptions = () => {
        if (!selectedLocationSection) return []
        if (selectedLocationSection) {
          const currentFloors = locationHierarchy[0].subLocations.filter((sl) => sl.code === selectedLocationSection.value)
          const currentFloorsToOptions = currentFloors.length > 0 ? currentFloors[0].subLocations.map((fl) => ({ value: fl.code, label: fl.description })) : []
          return currentFloorsToOptions
        } else return []
    }

    const mappedSlackChannelsOptions = () => {
        if (!slackChannelSearch) return []
        return slackChannelSearch.map(s => ({ value: s.id, label: s.name}))
    }

    const mapDataToSubmit = (data: any) => {
        const clusterIds = data.clusterIds ? data.clusterIds.map(c => c.value) : []
        const tags = data.tags ? data.tags.map(t => t.value) : []
        const days = selectedLocationSection ? [...WEEKDAYS].filter((w, i) => checkboxes[i]) : undefined
        const contactEmail = data.contactAddressEmail ? [{ address: data.contactAddressEmail, type: AddressType.EPOST}] : []
        const contactSlackChannels = data.contactAddressesChannels ? data.contactAddressesChannels.map(c => ({ 
            address: c.value, 
            type: AddressType.SLACK,
            slackChannel: { id: c.value, name: c.label }
        })) : []
        const contactSlackUsers = data.contactAddressesUsers ? data.contactAddressesChannels.map(c => ({ 
            address: c.value, 
            type: AddressType.SLACK_USER,
            slackChannel: { id: c.value, name: c.label }
        })) : []

        return {
            ...data,
            clusterIds: clusterIds,
            tags: tags,
            officeHours: selectedLocationSection ? {
                locationCode: data.officeHours?.locationCode,
                days: days,
                information: data.officeHours?.information
            } : undefined,
            contactAddresses: [...contactSlackChannels, ...contactSlackUsers, ...contactEmail]
        } as ProductTeamFormValues
    }

    useEffect(() => {
        ;(async () => {
            const resLocationHierarchy = await getLocationHierarchy()
            if (resLocationHierarchy) setLocationHierarchy(resLocationHierarchy)
            
            if (initialValues) {
                if (initialValues.officeHours) {
                  setCheckboxes(WEEKDAYS.map((wd) => (initialValues.officeHours?.days?.includes(wd) ? true : false)))
                  setSelectedLocationSection({ value: initialValues.officeHours.location?.parent?.code, label: initialValues.officeHours.location?.parent?.displayName })
                  setSelectedLocationFloor({ value: initialValues.officeHours.locationCode, label: initialValues.officeHours.location?.description })
                }
            }

        })()
      }, [isOpen])
    
    
    return (
        <form> 
            <Modal
                open={isOpen}
                aria-label="Modal team edit"
                onClose={() => onClose()}
                aria-labelledby="modal-heading"
                className={styles.modalStyles}
            >
            <Modal.Content>
                <Heading spacing level="1" size="large">{title}</Heading>
                <Detail size="medium" className={css`font-size: 16px;`}>Obligatoriske felter er merket med *</Detail>

                <div className={styles.boxStyles}>
                    <div className={styles.row}>
                        <TextField 
                            label="Teamnavn *" 
                            type="text" 
                            error={errors.name?.message} 
                            className={css`width: 100%;`}
                            {...register("name", { required: "Må oppgis" })} 
                        />

                        <Controller
                            name="status"
                            control={control}
                            rules={{ required: "Må oppgis" }}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Status *</Label>
                                    <Select 
                                        {...field} 
                                        options={statusOptions}
                                        isClearable
                                        styles={customStyles}
                                        placeholder="Velg status"
                                        {...{ 
                                            onChange: (item: any) => item ? (field.onChange(item.value)) : field.onChange(null),
                                            value: statusOptions.find((item) => item.value === field.value)
                                        }}
                                    />
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className={styles.boxStyles}>
                    <Heading spacing level="1" size="large">Beskrivelse</Heading>
                    <Label size="small">Beskrivelse av teamet *</Label>
                    <BodyLong size="small">Skriv litt om hva teamet jobber med, lenker til dokumentasjon o.l.</BodyLong>
                    <BodyLong size="small" className={css`margin-top: 1.5rem;`}>Støtter Markdown (shift+enter for linjeshift)</BodyLong>
                    
                    <Textarea label="" hideLabel rows={15} {...register("description", { required: "Må oppgis" })} error={errors.description?.message} />
                    
                </div>

                <div className={styles.boxStyles}>
                    <Heading spacing level="1" size="large">Kort fortalt</Heading>
                    <div className={styles.row}>
                        <Controller
                            name="productAreaId"
                            control={control}
                            rules={{ required: "Må oppgis" }}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Område *</Label>
                                    <Select 
                                        {...field} 
                                        isClearable
                                        options={sortedProductAreaOptions(mapToOptions(productAreas))} 
                                        styles={customStyles}
                                        {...{
                                            onChange: (item: any) => {
                                                if (item) {
                                                    field.onChange(item.value)
                                                    checkIfDefaultArea(item.value) ? setShowTeamOwner(true) : setShowTeamOwner(false)
                                                } else {
                                                    field.onChange(null)
                                                    setShowTeamOwner(false)
                                                }
                                            },
                                            value: sortedProductAreaOptions(mapToOptions(productAreas)).find((item) => item.value === field.value)
                                        }}
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="clusterIds"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Klynger</Label>
                                    <Select 
                                        {...field}
                                        isClearable
                                        options={clusterOptions} 
                                        styles={customStyles}
                                        isMulti
                                        placeholder="Søk og legg til klynger"
                                    />
                                </div>
                            )}
                        />
                    </div>
                    
                    <div className={styles.row}>
                        <Controller
                            name="teamType"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Teamtype</Label>
                                    <Select 
                                        {...field} 
                                        isClearable
                                        options={teamTypeOptions}
                                        styles={customStyles}
                                        {...{
                                            onChange: (item: any) => item ? field.onChange(item.value) : field.onChange(null),
                                            value: teamTypeOptions.find((item) => item.value === field.value)
                                        }}
                                    />
                                </div>
                            )}
                        />
                        
                        <Controller
                            name="teamOwnershipType"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Eierskap og finans</Label>
                                    <Select 
                                        {...field}
                                        isClearable
                                        options={teamOwnershipTypeOptions}
                                        styles={customStyles}
                                        {...{
                                            onChange: (item: any) => item ? field.onChange(item.value) : field.onChange(null),
                                            value: teamOwnershipTypeOptions.find((item) => item.value === field.value)
                                        }}
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <div className={styles.row}>
                        <Controller
                            name="naisTeams"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Team på NAIS</Label>
                                    <Select 
                                        {...field} 
                                        isDisabled
                                        isClearable
                                        options={[]}
                                        styles={customStyles}
                                        placeholder="Deaktivert inntil videre"
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Tagg</Label>
                                    <CreatableSelect 
                                        {...field}
                                        isClearable
                                        styles={customStyles}
                                        defaultValue={control._formValues.tags}
                                        options={teamSearchResult}
                                        isLoading={teamSearchLoading}
                                        onInputChange={e => setTeamSearch(e)}
                                        placeholder="Legg til tags"
                                        formatCreateLabel={value => `Legg til: ${value}`}
                                        isMulti
                                    />
                                </div>
                            )}
                        />
                    </div>
                </div>

                {showTeamOwner && (
                    <div className={styles.boxStyles}>
                        <Heading size="medium" className={css`margin-bottom: 1rem;`}>Teameier</Heading>
                        <div className={css`display: flex; align-items: center; margin-bottom: 1rem; gap: 0.5rem;`}>
                            <InformationColored />
                            <BodyShort>Teameier skal settes på team som ikke tilhører et område</BodyShort>
                        </div>
                        <Controller
                            name="teamOwnerIdent"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 50%;`}>
                                    <Label size="medium">Teameier</Label>
                                    <Select 
                                        {...field}
                                        isClearable
                                        options={!loading ? searchResult : []} 
                                        styles={customStyles}
                                        onInputChange={(e) => setResourceSearch(e)}
                                        isLoading={loading}
                                        placeholder="Søk og legg til person"
                                        {...{
                                            onChange: (item: any) => item ? field.onChange(item.value) : field.onChange(null),
                                            value: searchResult.find((item) => item.value === field.value)
                                        }}
                                    />
                                </div>
                            )}
                        />
                    </div>
                )}
                

                <div className={styles.boxStyles}>
                    <div className={styles.row}>
                        <Controller
                            name="contactPersonIdent"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Kontaktperson</Label>
                                    <Select 
                                        {...field}
                                        isClearable
                                        options={!loading ? searchResult : []} 
                                        styles={customStyles}
                                        onInputChange={(e) => setResourceSearch(e)}
                                        isLoading={loading}
                                        placeholder="Søk og legg til person"
                                        {...{
                                            onChange: (item: any) => item ? field.onChange(item.value) : field.onChange(null),
                                            value: searchResult.find((item) => item.value === field.value)
                                        }}
                                    />
                                </div>
                            )}
                        />

                        <TextField 
                            label="Teamets slack-kanal" 
                            type="text" 
                            error={errors.slackChannel?.message} 
                            placeholder="Søk og legg til slack kanaler"
                            {...register("slackChannel")} className={css`width: 100%;`}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={css`width: 100%;`}>
                            <Label size="medium">Adresse, bygg</Label>
                            <Select 
                                name="officeHourBuilding"
                                isClearable
                                options={getSectionOptions()} 
                                styles={customStyles}
                                value={selectedLocationSection}
                                onChange={(e) => setSelectedLocationSection(e)}
                                isLoading={loading}
                                placeholder="Velg adresse og bygg"
                            />
                        </div>
                        <div className={css`width: 100%;`}>
                            <Label size="medium">Etasje</Label>
                            <Controller
                                name="officeHours.locationCode"
                                control={control}
                                render={({ field }) => (
                                        <Select
                                            {...field}
                                            isClearable
                                            isDisabled={!selectedLocationSection ? true : false}
                                            options={selectedLocationSection ? getFloorOptions() : []} 
                                            styles={customStyles}
                                            value={selectedLocationFloor}
                                            isLoading={loading}
                                            placeholder="Velg etasje"
                                            {...{
                                                onChange: (item: any) => item ? field.onChange(item.value) : field.onChange(null),
                                                value: selectedLocationSection ? getFloorOptions().find((item) => item.value === field.value) : []
                                            }}
                                        />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <Label size="medium">Planlagte kontordager</Label>
                        <div className={css`display: flex; justify-content: space-between; width: 100%; margin-bottom: 1rem;`}>
                            {WEEKDAYS.map((day, i) => (
                                <Checkbox
                                    checked={checkboxes[i]}
                                    disabled={selectedLocationSection ? false : true}
                                    onChange={(e) => {
                                        const nextCheckboxes = [...checkboxes] 
                                        nextCheckboxes[i] = e.currentTarget.checked
                                        setCheckboxes(nextCheckboxes)
                                    }}
                                > 
                                    {getDisplayDay(day)}
                                </Checkbox>
                            ))}
                        </div>
                        
                        <TextField 
                            label="Kommentar for planlagte kontordager (valgfri)" 
                            value={officeHoursComment} 
                            disabled={selectedLocationSection ? false : true} 
                            {...register("officeHours.information")}
                        /> 
                    </div>
                </div>
                

                <div className={styles.boxStyles}>
                    <Heading size="medium" className={css`margin-bottom: 1rem;`}>Varslingsadresse</Heading>
                    <BodyShort size="medium" className={css`margin-bottom: 1rem;`}>
                        Brukes for å sende varsler, 
                        f.eks når en person har sluttet i NAV. 
                        Informasjonen vises ikke på teamets side. 
                        Teamet må ha minst én varslingsadresse. 
                    </BodyShort>

                    <div className={styles.row}>
                        <Controller
                            name="contactAddressesChannels"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Slack-kanal for varsler</Label>
                                    <Select 
                                        {...field}
                                        isClearable
                                        styles={customStyles}
                                        options={mappedSlackChannelsOptions()}
                                        isLoading={loadingSlackChannel}
                                        onInputChange={e => setSlackChannelSearch(e)}
                                        placeholder="Søk og legg til kanaler"
                                        isMulti
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="contactAddressesUsers"
                            control={control}
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Kontaktpersoner på slack</Label>
                                    <Select 
                                        {...field}
                                        isClearable
                                        options={!loading ? searchResult : []} 
                                        styles={customStyles}
                                        onInputChange={(e) => setResourceSearch(e)}
                                        isLoading={loading}
                                        placeholder="Søk og legg til person"
                                        isMulti
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <div className={styles.row}>
                        <TextField 
                            label="E-post"
                            placeholder="Søk og legg til person"
                            type="text" 
                            error={errors.contactAddressEmail?.message} 
                            className={css`width: 100%;`}
                            {...register("contactAddressEmail", { pattern: {value: /.+@nav.no/i, message: "Ikke gyldig @nav.no epost adresse"}})}
                        />
                    </div>
                </div>
                
                <div className={styles.buttonSection}>
                    <Button type="submit" onClick={handleSubmit((data) => onSubmitForm(mapDataToSubmit(data)))}>
                        Lagre
                    </Button>

                    <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => console.log(control._formValues, "FORMVALUES")}
                    >
                        Avbryt
                    </Button>
                </div>
            </Modal.Content>
        </Modal>
      </form>
    )
}

export default ModalTeam
