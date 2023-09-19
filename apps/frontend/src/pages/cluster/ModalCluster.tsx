import { css } from "@emotion/css";
import { BodyLong, Button, Detail, Heading, Label, Link, Modal, Textarea, TextField } from "@navikt/ds-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { mapToOptions } from "../../api/clusterApi";
import { useTagSearch } from "../../api/tagApi";
import { BasicCreatableSelect, BasicSelect, SelectLayoutWrapper } from "../../components/select/CustomSelectComponents";
import { sortedProductAreaOptions } from "../../components/team/ModalTeam";
import type { ClusterFormValues, ClusterSubmitValues, OptionType } from "../../constants";
import { Status } from "../../constants";
import { useAllProductAreas } from "../../hooks";
import { markdownLink } from "../../util/config";
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
};

type ModalAreaProperties = {
  onClose: () => void;
  title: string;
  initialValues: ClusterFormValues;
  isOpen: boolean;
  onSubmitForm: (values: ClusterSubmitValues) => void;
};

export const ModalCluster = (properties: ModalAreaProperties) => {
  const { onClose, title, initialValues, isOpen, onSubmitForm } = properties;
  const [productAreaIdValue, setProductAreaIdValue] = React.useState<string | undefined>(initialValues.productAreaId);
  const [tagSearchResult, setTagSearch, tagSearchLoading] = useTagSearch();
  const productAreas = useAllProductAreas({ status: Status.ACTIVE }).data;

  const statusOptions = Object.values(Status).map((st) => ({
    value: Object.keys(Status)[Object.values(Status).indexOf(st as Status)],
    label: intl[st],
  }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClusterFormValues>({
    defaultValues: {
      ...initialValues,
    },
  });

  const mapDataToSubmit = (data: ClusterFormValues) => {
    const tagsMapped = data.tags.map((t: OptionType) => t.value);
    setProductAreaIdValue(undefined);

    return {
      id: data.id,
      name: data.name,
      status: data.status,
      description: data.description,
      slackChannel: data.slackChannel,
      tags: tagsMapped,
      productAreaId: data.productAreaId,
    };
  };

  React.useEffect(() => {
    (async () => {
      setProductAreaIdValue(initialValues.productAreaId);
      reset({ ...initialValues });
    })();
  }, [isOpen]);

  return (
    <form>
      <Modal className={styles.modalStyles} header={{ heading: title }} onClose={onClose} open={isOpen}>
        <Modal.Body>
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
                placeholder="Skriv inn navn"
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
            <Label size="small">Beskrivelse av klyngen * </Label>
            <BodyLong size="small">Gi en kort beskrivelse av klyngen.</BodyLong>
            <BodyLong
              className={css`
                margin-top: 1.5rem;
                margin-bottom: 0.5rem;
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
                name="productAreaId"
                render={({ field }) => (
                  <div
                    className={css`
                      width: 100%;
                    `}
                  >
                    <SelectLayoutWrapper htmlFor="productAreaId" label="Område">
                      <BasicSelect
                        inputId="productAreaId"
                        name={field.name}
                        onChange={(event) => {
                          setProductAreaIdValue(event ? event.value : undefined);
                          setValue("productAreaId", event ? event.value : undefined);
                        }}
                        options={productAreas ? sortedProductAreaOptions(mapToOptions(productAreas)) : []}
                        placeholder=""
                        value={
                          productAreas &&
                          productAreaIdValue &&
                          sortedProductAreaOptions(mapToOptions(productAreas)).find(
                            (item) => item.value === productAreaIdValue,
                          )
                        }
                      />
                    </SelectLayoutWrapper>
                  </div>
                )}
              />

              <TextField
                error={errors.slackChannel?.message}
                label="Slack-kanal"
                placeholder="Skriv inn slack-kanal"
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
                    <SelectLayoutWrapper htmlFor="tags" label="Tagg">
                      <BasicCreatableSelect
                        defaultValue={control._formValues.tags}
                        formatCreateLabel={(value) => `Legg til: ${value}`}
                        inputId="tags"
                        isClearable
                        isLoading={tagSearchLoading}
                        isMulti
                        name={field.name}
                        onChange={field.onChange}
                        onInputChange={(event) => setTagSearch(event)}
                        options={tagSearchResult}
                        placeholder="Legg til tags"
                        value={field.value}
                      />
                    </SelectLayoutWrapper>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="sticky-modal-actions">
            <Button onClick={handleSubmit((data) => onSubmitForm(mapDataToSubmit(data)))} type="submit">
              Lagre
            </Button>

            <Button onClick={() => onClose()} type="button" variant="secondary">
              Avbryt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </form>
  );
};
