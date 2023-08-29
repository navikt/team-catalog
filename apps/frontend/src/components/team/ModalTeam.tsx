import { css } from "@emotion/css";
import { InformationSquareFillIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Detail,
  Heading,
  Label,
  Link,
  Modal,
  Textarea,
  TextField,
} from "@navikt/ds-react";
import * as React from "react";
import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";

import { mapToOptions } from "../../api/clusterApi";
import { getSlackChannelById, getSlackUserById, useSlackChannelSearch } from "../../api/ContactAddressApi";
import { getLocationHierarchy, mapLocationsToOptions } from "../../api/locationApi";
import { getResourceById, useResourceSearch } from "../../api/resourceApi";
import { useTagSearch } from "../../api/tagApi";
import type { LocationHierarchy, OptionType, ProductTeamFormValues, ProductTeamSubmitRequest } from "../../constants";
import { AddressType, Status, TeamOwnershipType, TeamType } from "../../constants";
import { useAllClusters, useAllProductAreas } from "../../hooks";
import { markdownLink } from "../../util/config";
import { intl } from "../../util/intl/intl";
import { BasicCreatableSelect, BasicSelect, SelectLayoutWrapper } from "../select/CustomSelectComponents";

const styles = {
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
    width: 100%;
    display: flex;
    gap: 1rem;
    bottom: -2rem;
    background-color: white;
    position: sticky;
    padding: 1rem;
  `,
  errorStyling: css`
    color: #ba3a26;
    font-weight: bold;
  `,
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
  onSubmitForm: (values: ProductTeamSubmitRequest) => void;
};

export const ModalTeam = (properties: ModalTeamProperties) => {
  const { onClose, title, initialValues, isOpen, onSubmitForm } = properties;
  const clusters = useAllClusters({ status: Status.ACTIVE }).data;

  const [productAreaIdValue, setProductAreaIdValue] = React.useState<string | undefined>(initialValues.productAreaId);
  const [locationHierarchy, setLocationHierarchy] = React.useState<LocationHierarchy[]>([]);
  const [selectedLocationSection, setSelectedLocationSection] = React.useState<OptionType>();
  const [officeHoursComment] = React.useState<string>();
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

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
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
      return currentFloors.length > 0
        ? currentFloors[0].subLocations.map((fl) => ({ value: fl.code, label: fl.description }))
        : [];
    } else return [];
  };

  const mappedSlackChannelsOptions = () => {
    if (!slackChannelSearch) return [];
    return slackChannelSearch.map((s) => ({ value: s.id, label: s.name ?? "" }));
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
          productAreaId: productAreaIdValue,
          contactPersonIdent: responseContactPerson?.navIdent
            ? { value: responseContactPerson?.navIdent, label: responseContactPerson.fullName }
            : undefined,
          teamOwnerIdent: responseTeamOwner?.navIdent
            ? { value: responseTeamOwner.navIdent, label: responseTeamOwner.fullName }
            : undefined,
          clusterIds: mapToOptions(
            clusters?.filter((c) => c.id === initialValues.clusterIds.find((ci) => ci.value === c.id)?.value),
          ),
          contactAddressesUsers: contactSlackUsers,
          contactAddressesChannels: contactSlackChannels,
        });
      }
    })();
  }, [isOpen]);

  return (
    <Modal aria-label="Modal team edit" aria-labelledby="modal-heading" onClose={onClose} open={isOpen}>
      <Modal.Header>
        <Heading level="1" size="large" spacing>
          {title}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <form>
          <Detail
            className={css`
              font-size: 16px;
            `}
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
                    <SelectLayoutWrapper htmlFor="status" label="Status *">
                      <BasicSelect
                        inputId="status"
                        name={field.name}
                        onChange={(item) => (item ? field.onChange(item.value) : field.onChange(undefined))}
                        options={statusOptions}
                        placeholder="Velg status"
                        value={statusOptions.find((item) => item.value === field.value)}
                      />
                    </SelectLayoutWrapper>
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
              Støtter{" "}
              <span>
                <Link href={markdownLink} rel="noopener noreferrer" target="_blank">
                  Markdown
                </Link>
              </span>{" "}
              (shift+enter for linjeshift)
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
                defaultValue={control._formValues.productAreaId}
                name="productAreaId"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <SelectLayoutWrapper htmlFor="productAreaId" label="Område *">
                      <BasicSelect
                        inputId="productAreaId"
                        name={field.name}
                        onChange={(event) => {
                          if (event) {
                            setProductAreaIdValue(event.value);
                            setValue("productAreaId", event.value);
                            checkIfDefaultArea(event.value) ? setShowTeamOwner(true) : setShowTeamOwner(false);
                          } else {
                            setProductAreaIdValue(undefined);
                            setValue("productAreaId", undefined);
                            setShowTeamOwner(false);
                          }
                        }}
                        options={productAreas ? sortedProductAreaOptions(mapToOptions(productAreas)) : []}
                        placeholder="Velg område"
                        value={
                          productAreas &&
                          sortedProductAreaOptions(mapToOptions(productAreas)).find(
                            (item) => item.value === productAreaIdValue,
                          )
                        }
                      />
                    </SelectLayoutWrapper>

                    {errors.productAreaId?.message && !productAreaIdValue && (
                      <li className={styles.errorStyling}> {errors.productAreaId.message}</li>
                    )}
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
                    <SelectLayoutWrapper htmlFor="clusterIds" label="Klynger">
                      <BasicSelect
                        defaultValue={control._formValues.clusterIds}
                        inputId="clusterIds"
                        isClearable
                        isMulti
                        name={field.name}
                        onChange={field.onChange}
                        options={clusterOptions}
                        placeholder="Søk og legg til klynger"
                        value={field.value}
                      />
                    </SelectLayoutWrapper>
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
                    <SelectLayoutWrapper htmlFor="teamType" label="Teamtype">
                      <BasicSelect
                        inputId="teamType"
                        name={field.name}
                        onChange={(item) => (item ? field.onChange(item.value) : field.onChange(undefined))}
                        options={teamTypeOptions}
                        value={teamTypeOptions.find((item) => item.value === field.value)}
                      />
                    </SelectLayoutWrapper>
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
                    <SelectLayoutWrapper htmlFor="teamOwnershipType" label="Eierskap og finans">
                      <BasicSelect
                        inputId="teamOwnershipType"
                        name={field.name}
                        onChange={(item) => (item ? field.onChange(item.value) : field.onChange(undefined))}
                        options={teamOwnershipTypeOptions}
                        value={teamOwnershipTypeOptions.find((item) => item.value === field.value)}
                      />
                    </SelectLayoutWrapper>
                  </div>
                )}
              />
            </div>

            <div className={styles.row}>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <SelectLayoutWrapper htmlFor="tags" label="Tagg">
                      <BasicCreatableSelect
                        defaultValue={control._formValues.tags}
                        formatCreateLabel={(value) => `Legg til: ${value}`}
                        inputId="tags"
                        isClearable
                        isLoading={teamSearchLoading}
                        isMulti
                        name={field.name}
                        onChange={field.onChange}
                        onInputChange={(event) => setTeamSearch(event)}
                        options={teamSearchResult}
                        placeholder="Legg til tags"
                        value={field.value}
                      />
                    </SelectLayoutWrapper>
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
                <InformationSquareFillIcon />
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
                    <SelectLayoutWrapper htmlFor="teamOwnerIdent" label="Teameier">
                      <BasicSelect
                        inputId="teamOwnerIdent"
                        isLoading={loadingTeamOwner}
                        name={field.name}
                        onChange={field.onChange}
                        onInputChange={(event) => setResourceSearchTeamOwner(event)}
                        options={loadingTeamOwner ? [] : searchResultTeamOwner}
                        placeholder="Søk og legg til person"
                        value={field.value}
                      />
                    </SelectLayoutWrapper>
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
                    <SelectLayoutWrapper htmlFor="contactPersonIdent" label="Kontaktperson">
                      <BasicSelect
                        inputId="contactPersonIdent"
                        isLoading={loadingContactPerson}
                        name={field.name}
                        onChange={field.onChange}
                        onInputChange={(event) => setResourceSearchContactPerson(event)}
                        options={loadingContactPerson ? [] : searchResultContactPerson}
                        placeholder="Søk og legg til person"
                        value={field.value}
                      />
                    </SelectLayoutWrapper>
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
                <SelectLayoutWrapper htmlFor="officeHourBuilding" label="Adresse, bygg">
                  <BasicSelect
                    name="officeHourBuilding"
                    onChange={(event) => {
                      setSelectedLocationSection(event as OptionType);
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      // eslint-disable-next-line unicorn/no-null
                      setValue("officeHours.locationFloor", null);
                    }}
                    options={getSectionOptions()}
                    placeholder="Velg adresse og bygg"
                    value={selectedLocationSection}
                  />
                </SelectLayoutWrapper>
              </div>
              <div
                className={css`
                  width: 100%;
                `}
              >
                <Controller
                  control={control}
                  name="officeHours.locationFloor"
                  render={({ field }) => (
                    <Fragment>
                      <SelectLayoutWrapper
                        htmlFor="officeHours.locationFloor"
                        label={selectedLocationSection ? "Etasje *" : "Etasje"}
                      >
                        <BasicSelect
                          isDisabled={!selectedLocationSection}
                          name={field.name}
                          onChange={field.onChange}
                          options={selectedLocationSection ? getFloorOptions() : []}
                          placeholder="Velg etasje"
                          value={field.value}
                        />
                      </SelectLayoutWrapper>
                      {selectedLocationSection &&
                        errors.officeHours &&
                        errors.officeHours.locationFloor &&
                        errors.officeHours.locationFloor.message && (
                          <li className={styles.errorStyling}> {errors.officeHours.locationFloor.message}</li>
                        )}
                    </Fragment>
                  )}
                  rules={{ required: selectedLocationSection ? "Må oppgis" : false }}
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
                    disabled={!selectedLocationSection}
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
                disabled={!selectedLocationSection}
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
                    <SelectLayoutWrapper htmlFor="contactAddressesChannels" label="Slack-kanal for varsler">
                      <BasicSelect
                        inputId="contactAddressesChannels"
                        isLoading={loadingSlackChannel}
                        isMulti
                        name={field.name}
                        onChange={field.onChange}
                        onInputChange={(event) => setSlackChannelSearch(event)}
                        options={mappedSlackChannelsOptions()}
                        placeholder="Søk og legg til kanaler"
                        value={field.value}
                      />
                    </SelectLayoutWrapper>
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
                    <SelectLayoutWrapper htmlFor="contactAddressesUsers" label="Kontaktpersoner på slack">
                      <BasicSelect
                        inputId="contactAddressesUsers"
                        isLoading={loadingContactUser}
                        isMulti
                        name={field.name}
                        onChange={field.onChange}
                        onInputChange={(event) => setResourceSearchContactUser(event)}
                        options={loadingContactUser ? [] : searchResultContactUser}
                        placeholder="Søk og legg til person"
                        value={field.value}
                      />
                    </SelectLayoutWrapper>
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
                placeholder="Skriv inn e-post"
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
        </form>
      </Modal.Body>
    </Modal>
  );
};
