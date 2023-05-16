import { css } from "@emotion/css";
import { Label, TextField } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuditLog } from "../../api/adminApi";
import { AuditRecentTable } from "../../components/admin/AuditRecentTable";
import { PageHeader } from "../../components/PageHeader";
import { Group, useDebouncedState, userHasGroup, useUser } from "../../hooks";
import _ from 'lodash'
import { AuditLog } from "../../constants";

export const AuditPage = () => {
    const params = useParams<{ id?: string; auditId?: string }>()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()
    const [auditLog, setAuditLog] = useState<AuditLog>()
    const [idSearch, setIdInput, idInput] = useDebouncedState(params.id || '', 400)

    const user = useUser();
    
    const lookupVersion = (id?: string) => {
        ;(async () => {
          if (id === auditLog?.id) {
            return
          }
          setAuditLog(undefined)
          setError(undefined)
          if (!id) {
            !!params.id && navigate('/admin/audit')
            return
          }

          setLoading(true)

          try {
            const log = await getAuditLog(id)
            

            setAuditLog(log)

            if (log.audits.length && id !== params.id) {
              console.log("TEST")
              navigate(`/admin/audit/${id}`)
            }
          } catch (e: any) {
            setError(e)
          }
          setLoading(false)
        })()
    }

     
    useEffect(() => setIdInput(params.id || ''), [params.id])
    useEffect(() => lookupVersion(idSearch), [idSearch])

    if (!userHasGroup(user, Group.ADMIN)) {
        return <>Fant ikke siden.</>;
    }

    return (
        <div>
            <PageHeader title="Versjonering" />

            <div className={css`display: flex; margin-bottom: 1rem; margin-top: 1rem; gap: 2rem; width: 500px;`}>
                <Label>Søk etter id </Label>
                <TextField
                    hideLabel
                    label="" 
                    value={idInput}
                    onChange={(e) => setIdInput(e.currentTarget.value)}
                    className={css`width: 300px;`}
                    size="small"
                />
            </div>

            <AuditRecentTable show={!idInput} />
        </div>
    )
};
