import { useAllProductAreas, useAllTeams } from "../hooks";
import { ProductArea, ProductTeam, Status } from "../constants";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table } from "@navikt/ds-react";

export enum TagType {
    AREA = "Område",
    TEAM = "Team",
    CLUSTER = "Klynge",
}

type TagListType = {
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

    // const clusterQuery = useQuery({
    //     queryKey: ["getAllClusters", status],
    //     queryFn: () => getAllClusters({ status }),
    //     select: (data: any) => data.content,
    // });
    // const clusters = clusterQuery.data ?? [];


    useEffect(() => {
        setDisplayList([])
        let filteredTeams: TagListType[] = teams.filter((t: ProductTeam) => params.id && t.tags.includes(params.id)).map((ft: ProductTeam) => ({
            name: ft.name,
            type: TagType.TEAM,
            description: ft.description
        }))
        let filteredAreas: TagListType[] = productAreas.filter((p: ProductArea) => params.id && p.tags.includes(params.id)).map((fp: ProductArea) => ({
            name: fp.name,
            type: TagType.AREA,
            description: fp.description
        }))

        setDisplayList([...filteredTeams, ...filteredAreas])
    }, [params]);

    return (
        <div>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Beskrivelse</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Type</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {displayList.map((item: TagListType, i) => {
                    return (
                        <Table.Row key={i + item.name}>
                            <Table.HeaderCell scope="row">{item.name}</Table.HeaderCell>
                            <Table.DataCell>{item.description}</Table.DataCell>
                            <Table.DataCell>{item.type}</Table.DataCell>
                        </Table.Row>
                    );
                    })}
                </Table.Body>
            </Table>
        </div>
    )
}

export default TagPage