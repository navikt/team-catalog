import { useAllClusters, useAllProductAreas, useAllTeams } from "../hooks";
import { ProductArea, ProductTeam, Status, Cluster } from "../constants";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SortState, Table } from "@navikt/ds-react";
import { PageHeader } from "../components/PageHeader";
import { css } from "@emotion/css";

export enum TagType {
    AREA = "Område",
    TEAM = "Team",
    CLUSTER = "Klynge",
}

type TagListType = {
    id: string,
    name: string,
    type: TagType,
    description: string
}

const TagPage = () => {
    const params = useParams<{ id: string }>();
    const [status, setStatus] = useState<Status>(Status.ACTIVE);
    const [displayList, setDisplayList] = useState<TagListType[]>([])

    const teamQuery = useAllTeams({ status });
    const teams = teamQuery.data ?? [];

    const productAreaQuery = useAllProductAreas({ status });
    const productAreas = productAreaQuery.data ?? [];

    const clusterQuery = useAllClusters({ status })
    const clusters = clusterQuery.data ?? [];

    const getUrl = (item: TagListType) => {
        if (item.type === TagType.AREA) return `/area/${item.id}`

        if (item.type === TagType.TEAM) 
            return `/team/${item.id}`
        else 
            return `/cluster/${item.id}`
    }

    useEffect(() => {
        let filteredTeams: TagListType[] = [...teams].filter((t: ProductTeam) => params.id && t.tags.includes(params.id)).map((ft: ProductTeam) => ({
            id: ft.id,
            name: ft.name,
            type: TagType.TEAM,
            description: ft.description
        }))
        let filteredAreas: TagListType[] = [...productAreas].filter((p: ProductArea) => params.id && p.tags.includes(params.id)).map((fp: ProductArea) => ({
            id: fp.id,
            name: fp.name,
            type: TagType.AREA,
            description: fp.description
        }))

        let filteredClusters: TagListType[] = [...clusters].filter((c: Cluster) => params.id && c.tags.includes(params.id)).map((c: Cluster) => ({
            id: c.id,
            name: c.name,
            type: TagType.CLUSTER,
            description: c.description
        }))

        setDisplayList([...filteredTeams, ...filteredAreas, ...filteredClusters])
    }, [params, teams, productAreas, clusters]);

    return (
        <div>
            <PageHeader title={`Tagg: ${params.id}`} />

            <Table className={css`margin-top: 1rem;`}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader scope="col">Navn</Table.ColumnHeader>
                        <Table.ColumnHeader scope="col">Type</Table.ColumnHeader>
                        <Table.ColumnHeader scope="col">Beskrivelse</Table.ColumnHeader>

                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {displayList.map((item: TagListType, i) => {
                    return (
                        <Table.Row key={i + item.name}>
                            <Table.DataCell className={css`width: 20%;`}>
                                <Link to={getUrl(item)}>{item.name}</Link>
                            </Table.DataCell>
                            <Table.DataCell className={css`width: 25%;`}>{item.type}</Table.DataCell>
                            <Table.DataCell>{item.description}</Table.DataCell>
                        </Table.Row>
                    );
                    })}
                </Table.Body>
            </Table>
        </div>
    )
}

export default TagPage