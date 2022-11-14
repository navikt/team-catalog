import { css } from "@emotion/css";
import { BodyLong, Loader, Table } from "@navikt/ds-react";
import { Link } from "react-router-dom";
import { getAllMemberships } from "../../api";
import { useAllTeams } from "../../api/teamApi";
import { ProductTeam, Resource } from "../../constants";
import { intl } from "../../util/intl/intl";
import { theme } from "../../util/theme";
import { UserImage } from "../UserImage";

type TableResourceProps = {
    members: Resource[]
}

const TableResource = (props: TableResourceProps) => {
    const { members } = props
    const teams = useAllTeams()

    const displayTeams = (ident: string) => {
        if (!teams) return
        
        const teamsMember = teams.map((t: ProductTeam) =>  ({ id: t.id, name: t.name, roles: t.members.find((tm) => tm.navIdent === ident)?.roles }))
                                 .filter((t) => !!t.roles?.length)
        
        
        if (!teamsMember) return

        return (
            <>
                {teamsMember.map(tm => (
                    <div className={css`display: flex; align-items:center;`}>
                        <Link to={`/team/${tm.id}`} className={theme.linkWithUnderline}>{tm.name}</Link> &nbsp; <BodyLong size="medium">- {tm.roles!.map((r) => intl[r]).join(', ')}</BodyLong>
                    </div>
                ))}
            </>
        )
    }

    return (
        <>
            {!teams && <Loader size="medium" />}
            {members && teams && (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col" align="left"></Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="left">Navn</Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="left">Team</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {members.map((m, i) => {
                            return (
                                <Table.Row key={i + m.navIdent}>
                                    <Table.DataCell><UserImage ident={m.navIdent} size="35px"/></Table.DataCell>
                                    <Table.DataCell>{m.fullName}</Table.DataCell>
                                    <Table.DataCell>{displayTeams(m.navIdent) || <Loader size="small" />}</Table.DataCell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            )}
            
        </>
    )
}

export default TableResource