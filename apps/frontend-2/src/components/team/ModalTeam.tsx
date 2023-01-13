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
  TextField,
} from "@navikt/ds-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "react-query";
import type { MultiValue, StylesConfig } from "react-select";
import Select, { createFilter } from "react-select";
import CreatableSelect from "react-select/creatable";
import type { FilterOptionOption } from "react-select/dist/declarations/src/filters";

import { getNaisTeams, getResourceById, mapToOptions, useResourceSearch, useTagSearch } from "../../api";
import { getSlackChannelById, getSlackUserById, useSlackChannelSearch } from "../../api/ContactAddressApi";
import { getLocationHierarchy, mapLocationsToOptions } from "../../api/location";
import type {
  LocationHierarchy,
  NaisTeam,
  OptionType,
  ProductTeamFormValues,
  ProductTeamSubmitValues,
} from "../../constants";
import { AddressType, Cluster, PageResponse, ProductArea, Status, TeamOwnershipType, TeamType } from "../../constants";
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

const customStyles: StylesConfig<any> = {
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
      return "Mandag";
    }
    case "TUESDAY": {
      return "Tirsdag";
    }
    case "WEDNESDAY": {
      return "Onsdag";
    }
    case "THURSDAY": {
      return "Torsdag";
    }
    case "FRIDAY": {
      return "Fredag";
    }
    default: {
      break;
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
  onClose: () => void;
  title: string;
  initialValues: ProductTeamFormValues;
  isOpen: boolean;
  onSubmitForm: (values: ProductTeamSubmitValues) => void;
};

const ModalTeam = (properties: ModalTeamProperties) => {
  const { onClose, title, initialValues, isOpen, onSubmitForm } = properties;
  const clusters = useAllClusters({ status: Status.ACTIVE }).data;

  const [locationHierarchy, setLocationHierarchy] = React.useState<LocationHierarchy[]>([]);
  const [selectedLocationSection, setSelectedLocationSection] = React.useState<OptionType>();
  const [selectedLocationFloor, setSelectedLocationFloor] = React.useState<OptionType>();
  const [officeHoursComment, setOfficeHoursComment] = React.useState<string>();
  const [checkboxes, setCheckboxes] = React.useState<boolean[]>([false, false, false, false, false]);
  const [showTeamOwner, setShowTeamOwner] = React.useState<boolean>(false);

  const productAreas = useAllProductAreas({ status: Status.ACTIVE }).data;
  const [teamSearchResult, setTeamSearch, teamSearchLoading] = useTagSearch();
  const [searchResultContactPerson, setResourceSearchContactPerson, loadingContactPerson] = useResourceSearch();
  const [searchResultTeamOwner, setResourceSearchTeamOwner, loadingTeamOwner] = useResourceSearch();
  const [searchResultContactUser, setResourceSearchContactUser, loadingContactUser] = useResourceSearch();
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

  const naisTeamQuery = useQuery("naisTeams", () => getNaisTeams());
  const naisTeams = naisTeamQuery.data;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ProductTeamFormValues>({
    defaultValues: {
      ...initialValues,
    },
  });

  const checkIfDefaultArea = (selectedArea: string) => {
    let areaObject = undefined;
    if (productAreas) {
      areaObject = productAreas.find((it) => it.id === selectedArea);
    }
    return !!areaObject && areaObject.defaultArea;
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
    const clusterIds = data.clusterIds.map((c) => c.value);
    const tagsMapped = data.tags.map((t) => t.value);
    const days = selectedLocationSection ? [...WEEKDAYS].filter((w, index) => checkboxes[index]) : undefined;
    const contactPersonIdentValue = data.contactPersonIdent ? data.contactPersonIdent.value : undefined;
    const teamOwnerIdentValue = data.teamOwnerIdent ? data.teamOwnerIdent?.value : undefined;

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
          email: c.email,
        }))
      : [];

    return {
      ...data,
      clusterIds: clusterIds,
      tags: tagsMapped,
      contactPersonIdent: contactPersonIdentValue,
      teamOwnerIdent: teamOwnerIdentValue,
      officeHours: selectedLocationSection
        ? {
            locationCode: data.officeHours?.locationFloor?.value,
            days: days,
            information: data.officeHours?.information,
          }
        : undefined,
      contactAddresses: [...contactSlackChannels, ...contactSlackUsers, ...contactEmail],
    };
  };

  React.useEffect(() => {
    (async () => {
      const responseLocationHierarchy = await getLocationHierarchy();

      if (responseLocationHierarchy) {
        setLocationHierarchy(responseLocationHierarchy);
      }
      if (initialValues) {
        let responseContactPerson;
        let responseTeamOwner;
        let contactSlackUsers;
        let contactSlackChannels;

        if (initialValues.officeHours) {
          setCheckboxes(WEEKDAYS.map((wd) => !!initialValues.officeHours?.days?.includes(wd)));
          setSelectedLocationSection({
            value: initialValues.officeHours.parent?.code || "",
            label: initialValues.officeHours.parent?.displayName || "",
          });
        }
        if (initialValues.contactPersonIdent)
          responseContactPerson = await getResourceById(initialValues.contactPersonIdent.value);
        if (initialValues.teamOwnerIdent) {
          setShowTeamOwner(true);
          responseTeamOwner = await getResourceById(initialValues.teamOwnerIdent.value);
        }

        if (initialValues.contactAddressesUsers) {
          console.log(initialValues.contactAddressesUsers, "Initial");
          contactSlackUsers = initialValues.contactAddressesUsers.map(async (c) => {
            const response = await getSlackUserById(c.value);
            return { value: response.id, label: response.name || "" };
          });
          try {
            contactSlackUsers = await Promise.all(contactSlackUsers);
          } catch {
            contactSlackUsers = undefined;
          }
        }
        if (initialValues.contactAddressesChannels) {
          contactSlackChannels = initialValues.contactAddressesChannels.map(async (c) => {
            const response = await getSlackChannelById(c.value);
            return { value: response.id, label: response.name || "" };
          });
          try {
            contactSlackChannels = await Promise.all(contactSlackChannels);
          } catch {
            contactSlackChannels = undefined;
          }
        }

        // Resetting defaultValues used in the form
        reset({
          ...initialValues,
          contactPersonIdent: responseContactPerson?.navIdent
            ? { value: responseContactPerson?.navIdent, label: responseContactPerson.fullName }
            : undefined,
          teamOwnerIdent: responseTeamOwner?.navIdent
            ? { value: responseTeamOwner.navIdent, label: responseTeamOwner.fullName }
            : undefined,
          clusterIds: mapToOptions(
            clusters?.filter((c) => c.id === initialValues.clusterIds.find((ci) => ci.value === c.id)?.value)
          ),
          contactAddressesUsers: contactSlackUsers,
          contactAddressesChannels: contactSlackChannels,
        });
      }
    })();
  }, [isOpen, initialValues]);

  return (
    <form>
      <Modal
        aria-label="Modal team edit"
        aria-labelledby="modal-heading"
        className={styles.modalStyles}
        onClose={() => onClose()}
        open={isOpen}
        shouldCloseOnOverlayClick={false}
      >
        <Modal.Content>
          <Heading level="1" size="large" spacing>
            {title}
          </Heading>
          <Detail
            className={css`
              font-size: 16px;
            `}
            size="medium"
          >
            Obligatoriske felter er merket med *
          </Detail>

          <div className={styles.boxStyles}>
            <div className={styles.row}>
              <TextField
                className={css`
                  width: 100%;
                `}
                error={errors.name?.message}
                label="Teamnavn *"
                type="text"
                {...register("name", { required: "Må oppgis" })}
              />

              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Status *</Label>
                    <Select
                      {...field}
                      isClearable
                      options={statusOptions}
                      placeholder="Velg status"
                      styles={customStyles}
                      {...{
                        onChange: (item: any) => (item ? field.onChange(item.value) : field.onChange(undefined)),
                        value: statusOptions.find((item) => item.value === field.value),
                      }}
                    />
                  </div>
                )}
                rules={{ required: "Må oppgis" }}
              />
            </div>
          </div>

          <div className={styles.boxStyles}>
            <Heading level="1" size="medium" spacing>
              Beskrivelse
            </Heading>
            <Label size="small">Beskrivelse av teamet *</Label>
            <BodyLong size="small">Skriv litt om hva teamet jobber med, lenker til dokumentasjon o.l.</BodyLong>
            <BodyLong
              className={css`
                margin-top: 1.5rem;
              `}
              size="small"
            >
              Støtter Markdown (shift+enter for linjeshift)
            </BodyLong>

            <Textarea
              error={errors.description?.message}
              hideLabel
              label=""
              rows={15}
              {...register("description", { required: "Må oppgis" })}
            />
          </div>

          <div className={styles.boxStyles}>
            <Heading level="1" size="medium" spacing>
              Kort fortalt
            </Heading>
            <div className={styles.row}>
              <Controller
                control={control}
                name="productAreaId"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Område *</Label>
                    <Select
                      {...field}
                      isClearable
                      options={productAreas ? sortedProductAreaOptions(mapToOptions(productAreas)) : []}
                      styles={customStyles}
                      {...{
                        onChange: (item: any) => {
                          if (item) {
                            field.onChange(item.value);
                            checkIfDefaultArea(item.value) ? setShowTeamOwner(true) : setShowTeamOwner(false);
                          } else {
                            field.onChange(undefined);
                            setShowTeamOwner(false);
                          }
                        },
                        value:
                          productAreas &&
                          sortedProductAreaOptions(mapToOptions(productAreas)).find(
                            (item) => item.value === field.value
                          ),
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
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Klynger</Label>
                    <Select
                      {...field}
                      defaultValue={control._formValues.clusterIds}
                      isClearable
                      isMulti
                      options={clusterOptions}
                      placeholder="Søk og legg til klynger"
                      styles={customStyles}
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
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Teamtype</Label>
                    <Select
                      {...field}
                      isClearable
                      options={teamTypeOptions}
                      styles={customStyles}
                      {...{
                        onChange: (item: any) => (item ? field.onChange(item.value) : field.onChange(undefined)),
                        value: teamTypeOptions.find((item) => item.value === field.value),
                      }}
                    />
                  </div>
                )}
              />

              <Controller
                control={control}
                name="teamOwnershipType"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Eierskap og finans</Label>
                    <Select
                      {...field}
                      isClearable
                      options={teamOwnershipTypeOptions}
                      styles={customStyles}
                      {...{
                        onChange: (item: any) => (item ? field.onChange(item.value) : field.onChange(undefined)),
                        value: teamOwnershipTypeOptions.find((item) => item.value === field.value),
                      }}
                    />
                  </div>
                )}
              />
            </div>

            <div className={styles.row}>
              <Controller
                control={control}
                name="naisTeams"
                render={({ field, field: { onChange, value } }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Team på NAIS</Label>
                    <Select
                      {...field}
                      filterOption={(candidate: FilterOptionOption<NaisTeam>, input: string) =>
                        input.length >= 2 && createFilter({})(candidate, input)
                      }
                      getOptionLabel={(naisteam: NaisTeam) => naisteam.name}
                      getOptionValue={(naisteam: NaisTeam) => naisteam.id}
                      isClearable
                      isLoading={naisTeamQuery.isLoading}
                      isMulti
                      isSearchable
                      noOptionsMessage={(input) => {
                        if (input.inputValue.length < 2) {
                          return "Du må skrive minst 2 tegn for å søke";
                        }
                        return "Ingen valg tilgjengelig";
                      }}
                      onChange={(newValue) => onChange((newValue as MultiValue<NaisTeam>).map((team) => team.id))}
                      options={naisTeams?.content || []}
                      placeholder="Søk etter Nais team..."
                      styles={customStyles}
                      value={(naisTeams?.content || []).filter((team) => value.includes(team.id))}
                    />
                  </div>
                )}
              />

              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Tagg</Label>
                    <CreatableSelect
                      {...field}
                      defaultValue={control._formValues.tags}
                      formatCreateLabel={(value) => `Legg til: ${value}`}
                      isClearable
                      isLoading={teamSearchLoading}
                      isMulti
                      onInputChange={(event) => setTeamSearch(event)}
                      options={teamSearchResult}
                      placeholder="Legg til tags"
                      styles={customStyles}
                    />
                  </div>
                )}
              />
            </div>
          </div>

          {showTeamOwner && (
            <div className={styles.boxStyles}>
              <Heading
                className={css`
                  margin-bottom: 1rem;
                `}
                size="medium"
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
                control={control}
                defaultValue={control._formValues.teamOwnerIdent}
                name="teamOwnerIdent"
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
                      isLoading={loadingTeamOwner}
                      onInputChange={(event) => setResourceSearchTeamOwner(event)}
                      options={!loadingTeamOwner ? searchResultTeamOwner : []}
                      placeholder="Søk og legg til person"
                      styles={customStyles}
                    />
                  </div>
                )}
              />
            </div>
          )}

          <div className={styles.boxStyles}>
            <Heading level="1" size="medium" spacing>
              Her finner du oss
            </Heading>

            <div className={styles.row}>
              <Controller
                control={control}
                defaultValue={control._formValues.contactPersonIdent}
                name="contactPersonIdent"
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
                      isLoading={loadingContactPerson}
                      onInputChange={(event) => setResourceSearchContactPerson(event)}
                      options={!loadingContactPerson ? searchResultContactPerson : []}
                      placeholder="Søk og legg til person"
                      styles={customStyles}
                    />
                  </div>
                )}
              />

              <TextField
                error={errors.slackChannel?.message}
                label="Teamets slack-kanal"
                placeholder="Søk og legg til slack kanaler"
                type="text"
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
                  isClearable
                  name="officeHourBuilding"
                  onChange={(event) => setSelectedLocationSection(event as OptionType)}
                  options={getSectionOptions()}
                  placeholder="Velg adresse og bygg"
                  styles={customStyles}
                  value={selectedLocationSection}
                />
              </div>
              <div
                className={css`
                  width: 100%;
                `}
              >
                <Label size="medium">Etasje</Label>
                <Controller
                  control={control}
                  name="officeHours.locationFloor"
                  render={({ field }) => (
                    <Select
                      {...field}
                      isClearable
                      isDisabled={!selectedLocationSection ? true : false}
                      options={selectedLocationSection ? getFloorOptions() : []}
                      placeholder="Velg etasje"
                      styles={customStyles}
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
                    key={index}
                    onChange={(event) => {
                      const nextCheckboxes = [...checkboxes];
                      nextCheckboxes[index] = event.currentTarget.checked;
                      setCheckboxes(nextCheckboxes);
                    }}
                  >
                    {getDisplayDay(day)}
                  </Checkbox>
                ))}
              </div>

              <TextField
                disabled={selectedLocationSection ? false : true}
                label="Kommentar for planlagte kontordager (valgfri)"
                value={officeHoursComment}
                {...register("officeHours.information")}
              />
            </div>
          </div>

          <div className={styles.boxStyles}>
            <Heading
              className={css`
                margin-bottom: 1rem;
              `}
              size="medium"
            >
              Varslingsadresse
            </Heading>
            <BodyShort
              className={css`
                margin-bottom: 1rem;
              `}
              size="medium"
            >
              Brukes for å sende varsler, f.eks når en person har sluttet i NAV. Informasjonen vises ikke på teamets
              side. Teamet må ha minst én varslingsadresse.
            </BodyShort>

            <div className={styles.row}>
              <Controller
                control={control}
                name="contactAddressesChannels"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <Label size="medium">Slack-kanal for varsler</Label>
                    <Select
                      {...field}
                      isClearable
                      isLoading={loadingSlackChannel}
                      isMulti
                      onInputChange={(event) => setSlackChannelSearch(event)}
                      options={mappedSlackChannelsOptions()}
                      placeholder="Søk og legg til kanaler"
                      styles={customStyles}
                    />
                  </div>
                )}
              />

              <Controller
                control={control}
                defaultValue={control._formValues.contactAddressesUsers}
                name="contactAddressesUsers"
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
                      isLoading={loadingContactUser}
                      isMulti
                      onInputChange={(event) => setResourceSearchContactUser(event)}
                      options={!loadingContactUser ? searchResultContactUser : []}
                      placeholder="Søk og legg til person"
                      styles={customStyles}
                    />
                  </div>
                )}
              />
            </div>

            <div className={styles.row}>
              <TextField
                className={css`
                  width: 100%;
                `}
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

            <Button onClick={() => onClose()} type="button" variant="secondary">
              Avbryt
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </form>
  );
};

export default ModalTeam;
