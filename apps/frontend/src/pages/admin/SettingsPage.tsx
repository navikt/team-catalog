import { css } from "@emotion/css";
import { TrashIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Table, TextField } from "@navikt/ds-react";
import { useEffect, useState } from "react";

import { getSettings, writeSettings } from "../../api/adminApi";
import { PageHeader } from "../../components/PageHeader";
import type { Settings } from "../../constants";
import { Group, userHasGroup, useUser } from "../../hooks";

export const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>();
  const [textFieldValue, setTextFieldValue] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const user = useUser();

  const load = async () => {
    setSettings(await getSettings());
  };

  const save = async () => {
    if (settings) {
      if (textFieldValue && settings.identFilter.includes(textFieldValue)) {
        setErrorMessage("Identen er allerede filtrert");
      } else {
        try {
          if (textFieldValue) {
            setSettings(await writeSettings({ identFilter: [...settings.identFilter, textFieldValue] }));
          }
        } catch {
          /* empty */
        }
      }
    }
  };

  const remove = async (identRemoved: string) => {
    if (settings) {
      try {
        setSettings(
          await writeSettings({ identFilter: settings.identFilter.filter((ident) => ident !== identRemoved) }),
        );
      } catch {
        /* empty */
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!userHasGroup(user, Group.ADMIN)) {
    return <>Fant ikke siden.</>;
  }

  return (
    <div>
      <PageHeader title="Bortfiltrering av identer" />

      <div
        className={css`
          margin-top: 1rem;
        `}
      >
        <div
          className={css`
            display: flex;
            gap: 2rem;
          `}
        >
          <TextField
            className={css`
              width: 400px;
            `}
            label=""
            onChange={(value) => {
              setTextFieldValue(value.currentTarget.value);
              setErrorMessage(undefined);
            }}
            placeholder="Skriv inn ident"
            type="text"
            value={textFieldValue}
          />

          <Button
            className={css`
              margin-top: 0.5rem;
            `}
            onClick={() => save()}
            size="small"
            variant="secondary"
          >
            Lagre
          </Button>
        </div>
        {errorMessage && (
          <BodyShort
            className={css`
              color: red;
              margin-top: 0.5rem;
            `}
          >
            {errorMessage}
          </BodyShort>
        )}

        <Table
          className={css`
            width: 500px;
            margin-top: 1rem;
          `}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
              <Table.HeaderCell align="right" scope="col">
                -
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {settings?.identFilter.map((ident, index) => {
              return (
                <Table.Row key={index + ident}>
                  <Table.HeaderCell scope="row">{ident}</Table.HeaderCell>
                  <Table.DataCell align="right">
                    <Button
                      className={css`
                        margin-top: 0.5rem;
                      `}
                      icon={<TrashIcon />}
                      onClick={() => remove(ident)}
                      size="small"
                      variant="secondary"
                    />
                  </Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};
