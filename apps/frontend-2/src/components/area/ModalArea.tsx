import { css } from "@emotion/css";
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
import Select, { MultiValue, StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
import { useTagSearch } from "../../api";
import { AreaType, OptionType, ProductAreaFormValues, ProductAreaSubmitValues, Status } from "../../constants";
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


type ModalAreaProperties = {
  onClose: () => void;
  title: string;
  initialValues: ProductAreaFormValues;
  isOpen: boolean;
  onSubmitForm: (values: ProductAreaSubmitValues) => void;
};

const ModalArea = (properties: ModalAreaProperties) => {
  const { onClose, title, initialValues, isOpen, onSubmitForm } = properties;

  const [tagSearchResult, setTagSearch, tagSearchLoading] = useTagSearch();

  const statusOptions = Object.values(Status).map((st) => ({
    value: Object.keys(Status)[Object.values(Status).indexOf(st as Status)],
    label: intl[st],
  }));

  const areaTypeOptions = Object.values(AreaType).map((at) => ({
    value: at,
    label: intl.getString(at + "_AREATYPE_DESCRIPTION"),
  }));

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ProductAreaFormValues>({
    defaultValues: {
      ...initialValues,
    },
  });

  const mapDataToSubmit = (data: ProductAreaFormValues) => {
    const tagsMapped = data.tags.map((t: OptionType) => t.value);

    return {
        ...data,
        tags: tagsMapped        
    };
  };

  React.useEffect(() => {
        reset({...initialValues});
  }, [isOpen, initialValues]);

  return (
    <form>
      <Modal
        aria-label="Modal area edit"
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
                label="Områdenavn *"
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
            <Label size="small">Beskrivelse av området * </Label>
            <BodyLong size="small"> 
                Skriv litt om hva dette produktområde jobber med. 
                Legg gjerne ved lenker til mer informasjon, for eksempel til Navet.
            </BodyLong>
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
                    name="areaType"
                    render={({ field }) => (
                    <div
                        className={css`
                        width: 100%;
                        `}
                    >
                        <Label size="medium">Områdetype</Label>
                        <Select
                        {...field}
                        isClearable
                        options={areaTypeOptions}
                        styles={customStyles}
                        {...{
                            onChange: (item: any) => (item ? field.onChange(item.value) : field.onChange(undefined)),
                            value: areaTypeOptions.find((item) => item.value === field.value),
                        }}
                        />
                    </div>
                    )}
                />

                <TextField
                    error={errors.slackChannel?.message}
                    label="Slack kanal"
                    placeholder="Legg inn slack kanal"
                    type="text"
                    {...register("slackChannel")}
                    className={css`
                    width: 100%;
                    `}
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
                        <Label size="medium">Tagg</Label>
                        <CreatableSelect
                            {...field}
                            defaultValue={control._formValues.tags}
                            formatCreateLabel={(value) => `Legg til: ${value}`}
                            isClearable
                            isLoading={tagSearchLoading}
                            isMulti
                            onInputChange={(event) => setTagSearch(event)}
                            options={tagSearchResult}
                            placeholder="Legg til tags"
                            styles={customStyles}
                        />
                    </div>
                    )}
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

export default ModalArea;
