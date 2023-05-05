import { css } from "@emotion/css";
import { Delete } from "@navikt/ds-icons";
import { BodyShort, Button, Table, TextField } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { getSettings, writeSettings } from "../../api/adminApi";
import { PageHeader } from "../../components/PageHeader";
import type { Settings } from "../../constants";
import { Group, userHasGroup, useUser } from "../../hooks";

export const SettingsPage = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState()
    const [settings, setSettings] = useState<Settings>()
    const [textFieldValue, setTextFieldValue] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<string | undefined>()

    const user = useUser();

    const load = async () => {
        setLoading(true)
        setSettings(await getSettings())
        setLoading(false)
      }
    
    const save = async () => {
        if (settings) {
            setLoading(true)

            if (settings.identFilter.find((s) => s === textFieldValue)) {
                setErrorMessage("Identen er allerede filtrert")
            } else {
                try {
                    if (textFieldValue) {
                        setSettings(await writeSettings({ identFilter: [...settings.identFilter, textFieldValue]}))
                    }
                } catch (e: any) {
                    setError(e)
                }
                setLoading(false)
            }
        }
    }

    const remove = async (identRemoved: string) => {
        if (settings) {
            console.log(settings.identFilter.filter(ident => ident !== identRemoved))
            try {
                setSettings(await writeSettings({ identFilter: [...settings.identFilter.filter(ident => ident !== identRemoved)]}))
            } catch (e: any) {
                setError(e)
            }
        }
    }

    useEffect(() => {
        load()
      }, [])

    if (!userHasGroup(user, Group.ADMIN)) {
        return <>Fant ikke siden.</>;
    }

    return (
        <div>
            <PageHeader title="Bortfiltrering av identer" />

            <div className={css`margin-top: 1rem;`}>
                <div className={css`display: flex; gap: 2rem;`}>
                    <TextField
                        label=""
                        value={textFieldValue}
                        onChange={(val) => {
                            setTextFieldValue(val.currentTarget.value)
                            setErrorMessage(undefined)
                        }}
                        placeholder="Skriv inn ident"
                        type="text"
                        className={css`width: 400px;`}                    
                    />


                    <Button
                        onClick={() => save()}
                        size="small"
                        variant="secondary"
                        className={css`margin-top: 0.5rem;`}
                    >
                        Lagre
                    </Button>
                </div>
                {errorMessage && <BodyShort className={css`color: red; margin-top: 0.5rem;`}>{errorMessage}</BodyShort>}

                <Table className={css`width: 500px; margin-top: 1rem;`}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">-</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {settings?.identFilter.map((ident, i) => {
                        return (
                            <Table.Row key={i + ident}>
                                <Table.HeaderCell scope="row">{ident}</Table.HeaderCell>
                                <Table.DataCell align="right">
                                    <Button
                                        icon={<Delete />}
                                        onClick={() => remove(ident)}
                                        size="small"
                                        variant="secondary"
                                        className={css`margin-top: 0.5rem;`}
                                    />
                                </Table.DataCell>   
                            </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
               
            </div>
        </div>
    )
};
