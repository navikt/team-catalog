import { css } from "@emotion/css";
import { InformationColored } from "@navikt/ds-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Detail,
  Heading,
  Label,
  Modal,
  Textarea,
  TextField
} from "@navikt/ds-react";
import * as React from "react"
import { Controller, useForm } from "react-hook-form";
import Select, { StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";

import { mapToOptions, useResourceSearch, useTagSearch } from "../../api";
import { useSlackChannelSearch } from "../../api/ContactAddressApi";
import { getLocationHierarchy, mapLocationsToOptions } from "../../api/location";
import {
  AddressType,
  LocationHierarchy,
  ProductArea,
  ProductTeamFormValues,
  Status,
  TeamOwnershipType,
  TeamType,
  Cluster,
  ProductTeamSubmitValues,
  OptionType
} from "../../constants";
import { useAllClusters, useAllProductAreas } from "../../hooks";
import { intl } from "../../util/intl/intl";

const styles = {
  modalStyles: css`
    width: 850px;
    min-height: 400px;
    padding: 1rem;
  `,
  boxStyles: css`
    background: #e6f1f8;
    border: 1px solid #236b7d;
    border-radius: 5px;
    min-height: 40px;
    margin-top: 1rem;
    padding: 2rem;
    width: 100%;
  `,
  row: css`
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1rem;
  `,
  buttonSection: css`
    border-top: 1px solid #cfcfcf;
    margin-top: 2rem;
    width: 100%;
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    position: sticky;
  `,
};

const customStyles: StylesConfig = {
  option: (provided, state) => ({
    ...provided,
    borderBottom: "1px dotted pink",
    color: "var(--navds-global-color-gray-900)",
    padding: 10,
    backgroundColor: state.isSelected ? "var(--navds-global-color-gray-100)" : "#FFFFFF",
  }),
  input: (provided, state) => ({
    ...provided,
    height: "40px",
    width: "40px",
  }),
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused
      ? "1px solid var(--navds-text-field-color-border)"
      : "1px solid var(--navds-text-field-color-border)",
    boxShadow: state.isFocused ? "var(--navds-shadow-focus)" : undefined,
    marginTop: "0.5rem",
  }),
  menu: (provided, state) => ({
    ...provided,
  }),
};

export const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
export const getDisplayDay = (day: string) => {
  switch (day) {
    case "MONDAY": {
        return 'Mandag'
      }
    case "TUESDAY": {
        return 'Tirsdag'
      }
    case "WEDNESDAY": {
        return 'Onsdag'
      }
    case "THURSDAY": {
        return 'Torsdag'
      }
    case "FRIDAY": {
        return 'Fredag'
      }
    default: {
        break
      }
  }
};

export const sortedProductAreaOptions = (productAreaOptions: { value: string; label: string }[]) =>
  productAreaOptions.sort((a, b) => sortItems(a.label.toLowerCase(), b.label.toLowerCase()));

export function sortItems(a: string, b: string) {
  if (a.localeCompare(b, "no") < 0) {
    return -1;
  } else if (a.localeCompare(b, "no") > 0) {
    return 1;
  }
  return 0;
}


type ModalTeamProperties = {
    onClose: () => void
    title: string
    initialValues: ProductTeamFormValues
    isOpen: boolean
    onSubmitForm: (values: ProductTeamSubmitValues) => void
}

const ModalTeam = (props: ModalTeamProperties) => {
  const { onClose, title, initialValues, isOpen, onSubmitForm } = props;
  const clusters = useAllClusters({status: Status.ACTIVE}).data

  const [locationHierarchy, setLocationHierarchy] = React.useState<LocationHierarchy[]>([]);
  const [selectedLocationSection, setSelectedLocationSection] = React.useState<OptionType>();
  const [selectedLocationFloor, setSelectedLocationFloor] = React.useState<OptionType>();
  const [officeHoursComment, setOfficeHoursComment] = React.useState<string>();
  const [checkboxes, setCheckboxes] = React.useState<boolean[]>([false, false, false, false, false]);
  const [showTeamOwner, setShowTeamOwner] = React.useState<boolean>(false);

  const productAreas = useAllProductAreas({status: Status.ACTIVE}).data;
  const [teamSearchResult, setTeamSearch, teamSearchLoading] = useTagSearch();
  const [searchResult, setResourceSearch, loading] = useResourceSearch();
  const [slackChannelSearch, setSlackChannelSearch, loadingSlackChannel] = useSlackChannelSearch();

  const statusOptions = Object.values(Status).map((st) => ({
    value: Object.keys(Status)[Object.values(Status).indexOf(st as Status)],
    label: intl[st],
  }));
  const clusterOptions = clusters ? mapToOptions(clusters).sort((a, b) => sortItems(a.label, b.label)) : [];
  const teamOwnershipTypeOptions = Object.values(TeamOwnershipType).map((tt) => ({
    value: tt,
    label: intl.getString(tt + "_DESCRIPTION"),
  }));
  const teamTypeOptions = Object.values(TeamType).map((tt) => ({
    value: tt,
    label: intl.getString(tt + "_DESCRIPTION"),
  }));

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ProductTeamFormValues>({
    defaultValues: {
      ...initialValues,
      clusterIds: mapToOptions(clusters?.filter(c => c.id === initialValues.clusterIds.find(ci => ci.value === c.id)?.value))
    },
  });

  const checkIfDefaultArea = (selectedArea: string) => {
    let areaObj = undefined
    if(productAreas){
      areaObj = productAreas.find((it) => it.id === selectedArea);
    }
    return !!areaObj && areaObj.defaultArea;
  };

  const getSectionOptions = () => {
    if (!locationHierarchy) return [];

    if (locationHierarchy.length > 0) {
      return mapLocationsToOptions(locationHierarchy[0].subLocations);
    }
  };

  const getFloorOptions = () => {
    if (!selectedLocationSection) return [];

    if (selectedLocationSection) {
      const currentFloors = locationHierarchy[0].subLocations.filter((sl) => sl.code === selectedLocationSection.value);
      const currentFloorsToOptions =
        currentFloors.length > 0
          ? currentFloors[0].subLocations.map((fl) => ({ value: fl.code, label: fl.description }))
          : [];
      return currentFloorsToOptions;
    } else return [];
  };

  const mappedSlackChannelsOptions = () => {
    if (!slackChannelSearch) return [];
    return slackChannelSearch.map((s) => ({ value: s.id, label: s.name }));
  };

  const mapDataToSubmit = (data: ProductTeamFormValues) => {
    const clusterIds = data.clusterIds;
    const tags = data.tags.map(t => t.value);
    const days = selectedLocationSection ? [...WEEKDAYS].filter((w, i) => checkboxes[i]) : undefined;
    const contactEmail = data.contactAddressEmail
      ? [{ address: data.contactAddressEmail, type: AddressType.EPOST }]
      : [];
    const contactSlackChannels = data.contactAddressesChannels
      ? data.contactAddressesChannels.map((c: OptionType) => ({
          address: c.value,
          type: AddressType.SLACK,
          slackChannel: { id: c.value, name: c.label },
        }))
      : [];
    const contactSlackUsers = data.contactAddressesUsers
      ? data.contactAddressesUsers.map((c: OptionType) => ({
          address: c.value,
          type: AddressType.SLACK_USER,
          slackChannel: { id: c.value, name: c.label },
        }))
      : [];

    return {
      ...data,
      clusterIds: clusterIds,
      tags: tags,
      officeHours: selectedLocationSection
        ? {
            locationCode: data.officeHours?.locationCode,
            days: days,
            information: data.officeHours?.information,
          }
        : undefined,
      contactAddresses: [...contactSlackChannels, ...contactSlackUsers, ...contactEmail],
    }
  };

  React.useEffect(() => {
    (async () => {
      const resLocationHierarchy = await getLocationHierarchy();
      if( resLocationHierarchy) {
        setLocationHierarchy(resLocationHierarchy);
      }
      if (initialValues && initialValues.officeHours) {
        setCheckboxes(WEEKDAYS.map((wd) => (!!initialValues.officeHours?.days?.includes(wd))))
        setSelectedLocationSection({ value: initialValues.officeHours.location?.parent?.code || "", label: initialValues.officeHours.location?.parent?.displayName || "" })
        setSelectedLocationFloor({ value: initialValues.officeHours.locationCode || "", label: initialValues.officeHours.location?.description || ""})
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
          <Heading spacing level="1" size="large">
            {title}
          </Heading>
          <Detail
            size="medium"
            className={css`
              font-size: 16px;
            `}
          >
            Obligatoriske felter er merket med *
          </Detail>

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
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Status *</Label>
                    <Select
                      {...field}
                      options={statusOptions}
                      isClearable
                      styles={customStyles}
                      placeholder="Velg status"
                      {...{
                        onChange: (item: any) => (item ? field.onChange(item.value) : field.onChange(null)),
                        value: statusOptions.find((item) => item.value === field.value),
                      }}
                    />
                  </div>
                )}
              />
            </div>
          </div>

          <div className={styles.boxStyles}>
            <Heading spacing level="1" size="medium">
              Beskrivelse
            </Heading>
            <Label size="small">Beskrivelse av teamet *</Label>
            <BodyLong size="small">Skriv litt om hva teamet jobber med, lenker til dokumentasjon o.l.</BodyLong>
            <BodyLong
              size="small"
              className={css`
                margin-top: 1.5rem;
              `}
            >
              Støtter Markdown (shift+enter for linjeshift)
            </BodyLong>

            <Textarea
              label=""
              hideLabel
              rows={15}
              error={errors.description?.message}
              {...register("description", { required: "Må oppgis" })}
            />
          </div>

          <div className={styles.boxStyles}>
            <Heading spacing level="1" size="medium">
              Kort fortalt
            </Heading>
            <div className={styles.row}>
              <Controller
                control={control}
                            name="productAreaId"
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Område *</Label>
                                    <Select
                                        {...field}
                                        isClearable
                                        options={productAreas ? sortedProductAreaOptions(mapToOptions(productAreas)) : []}
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
                                            value: productAreas && sortedProductAreaOptions(mapToOptions(productAreas)).find((item) => item.value === field.value)
                                        }}
                                    />
                                </div>
                            )}
                            rules={{ required: "Må oppgis" }}
              />

              <Controller
                          control={control}
                          name="clusterIds"
                            render={({ field }) => (
                                <div className={css`width: 100%;`}>
                                    <Label size="medium">Klynger</Label>
                                    <Select
                                        {...field}
                                        defaultValue={control._formValues.clusterIds}
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
                control={control}
                            name="teamType"
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
                control={control}
                            name="teamOwnershipType"
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
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
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
                control={control}
                            name="tags"
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
              <Heading
                size="medium"
                className={css`
                  margin-bottom: 1rem;
                `}
              >
                Teameier
              </Heading>
              <div
                className={css`
                  display: flex;
                  align-items: center;
                  margin-bottom: 1rem;
                  gap: 0.5rem;
                `}
              >
                <InformationColored />
                <BodyShort>Teameier skal settes på team som ikke tilhører et område</BodyShort>
              </div>
              <Controller
                name="teamOwnerIdent"
                control={control}
                render={({ field }) => (
                  <div
                    className={css`
                      width: 50%;
                    `}
                  >
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
                        onChange: (item: any) => (item ? field.onChange(item.value) : field.onChange(null)),
                        value: searchResult.find((item) => item.value === field.value),
                      }}
                    />
                  </div>
                )}
              />
            </div>
          )}

          <div className={styles.boxStyles}>
            <Heading spacing level="1" size="medium">
                Her finner du oss
            </Heading>

            <div className={styles.row}>
              <Controller
                name="contactPersonIdent"
                control={control}
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
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
                        onChange: (item: any) => (item ? field.onChange(item.value) : field.onChange(null)),
                        value: searchResult.find((item) => item.value === field.value),
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
                {...register("slackChannel")}
                className={css`
                  width: 100%;
                `}
              />
            </div>

            <div className={styles.row}>
              <div
                className={css`
                  width: 100%;
                `}
              >
                <Label size="medium">Adresse, bygg</Label>
                <Select
                  name="officeHourBuilding"
                  isClearable
                  options={getSectionOptions()}
                  styles={customStyles}
                  value={selectedLocationSection}
                  onChange={(e) => setSelectedLocationSection(e as OptionType)}
                  isLoading={loading}
                  placeholder="Velg adresse og bygg"
                />
              </div>
              <div
                className={css`
                  width: 100%;
                `}
              >
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
                      isLoading={loading}
                      placeholder="Velg etasje"
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <Label size="medium">Planlagte kontordager</Label>
              <div
                className={css`
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                  margin-bottom: 1rem;
                `}
              >
                {WEEKDAYS.map((day, index) => (
                                <Checkbox
                                    checked={checkboxes[index]}
                                    disabled={selectedLocationSection ? false : true}
                                    onChange={(e) => {
                                        const nextCheckboxes = [...checkboxes]
                                        nextCheckboxes[index] = e.currentTarget.checked
                      setCheckboxes(nextCheckboxes);
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
            <Heading
              size="medium"
              className={css`
                margin-bottom: 1rem;
              `}
            >
              Varslingsadresse
            </Heading>
            <BodyShort
              size="medium"
              className={css`
                margin-bottom: 1rem;
              `}
            >
              Brukes for å sende varsler, f.eks når en person har sluttet i NAV. Informasjonen vises ikke på teamets
              side. Teamet må ha minst én varslingsadresse.
            </BodyShort>

            <div className={styles.row}>
              <Controller
                control={control}
                            name="contactAddressesChannels"
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
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
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
                className={css`width: 100%;`}
                error={errors.contactAddressEmail?.message}
                label="E-post"
                placeholder="Søk og legg til person"
                type="text"
                {...register("contactAddressEmail", {
                  pattern: { value: /.+@nav.no/i, message: "Ikke gyldig @nav.no epost adresse" },
                })}
              />
            </div>
          </div>

          <div className={styles.buttonSection}>
            <Button onClick={handleSubmit((data) => onSubmitForm(mapDataToSubmit(data)))} type="submit">
              Lagre
            </Button>

            <Button type="button" variant="secondary" onClick={() => onClose()}>
              Avbryt
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </form>
  );
};

export default ModalTeam;
