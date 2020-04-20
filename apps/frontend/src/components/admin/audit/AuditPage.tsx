import { Block } from "baseui/block"
import React, { useEffect, useState } from "react"
import { RouteComponentProps, withRouter } from "react-router-dom"
import { Input } from "baseui/input"
import _ from "lodash"
import { H4, Paragraph2 } from "baseui/typography"
import { AuditLog } from './AuditTypes'
import { getAuditLog } from './AuditApi'
import { AuditView } from './AuditView'
import { AuditRecentTable } from './AuditRecentTable'
import { AuditLabel } from './AuditComponents'
import { useDebouncedState } from '../../../util/hooks'
import { intl } from '../../../util/intl/intl'

const format = (id: string) => _.trim(id, "\"")


const AuditPageImpl = (props: RouteComponentProps<{ id?: string, auditId?: string }>) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()
    const [auditLog, setAuditLog] = useState<AuditLog>()
    const [idSearch, setIdInput, idInput] = useDebouncedState(props.match.params.id || '', 400)

    const lookupVersion = (id?: string) => {
        (async () => {
            if (id === auditLog?.id) {
                return
            }
            setAuditLog(undefined)
            setError(undefined)
            if (!id) {
                !!props.match.params.id && props.history.push('/admin/audit')
                return
            }
            setLoading(true)
            try {
                const log = await getAuditLog(_.escape(id))
                setAuditLog(log)
                if (log.audits.length && id !== props.match.params.id) {
                    props.history.push(`/admin/audit/${id}`)
                }
            } catch (e) {
                setError(e)
            }
            setLoading(false)
        })()
    }

    useEffect(() => setIdInput(props.match.params.id || ''), [props.match.params.id])
    useEffect(() => lookupVersion(idSearch), [idSearch])

    return (
        <>
            <H4>{intl.audit}</H4>
            <Block marginBottom="1rem">
                <AuditLabel label={intl.searchId}>
                    <Input size="compact" value={idInput}
                           overrides={{Input: {style: {width: '300px'}}}}
                           placeholder={intl.id}
                           onChange={e => setIdInput(format((e.target as HTMLInputElement).value))}
                    />
                </AuditLabel>
            </Block>

            {error && <Paragraph2>{_.escape(error)}</Paragraph2>}
            {idInput && <AuditView auditLog={auditLog} auditId={props.match.params.auditId} loading={loading} viewId={lookupVersion}/>}
            <AuditRecentTable show={!idInput}/>
        </>
    )
}

export const AuditPage = withRouter(AuditPageImpl)
