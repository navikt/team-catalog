import { useAllProductAreas, useAllTeams } from "../hooks";
import { ProductArea, ProductTeam, Status } from "../constants";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SortState, Table } from "@navikt/ds-react";
import { PageHeader } from "../components/PageHeader";
import { css } from "@emotion/css";

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
    const [sort, setSort] = useState<SortState | undefined>(undefined);
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

    const handleSort = (sortKey: string) => {
        setSort(
          sort && sortKey === sort.orderBy && sort.direction === "descending"
            ? undefined
            : {
                orderBy: sortKey,
                direction:
                  sort && sortKey === sort.orderBy && sort.direction === "ascending"
                    ? "descending"
                    : "ascending",
              }
        );
      };

      const sortedList = (list: TagListType[]) => {
        return list.slice().sort((a, b) => {
            if (sort) {
              const comparator = (a, b: any, orderBy: any) => {
                if (b[orderBy] < a[orderBy] || b[orderBy] === undefined) {
                  return -1;
                }
                if (b[orderBy] > a[orderBy]) {
                  return 1;
                }
                return 0;
              };
        
              return sort.direction === "ascending"
                ? comparator(b, a, sort.orderBy)
                : comparator(a, b, sort.orderBy);
            }
            return 1;
        });
      }

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
            <PageHeader title={`Tagg: ${params.id}`} />

            <Table className={css`margin-top: 1rem;`} sort={sort} onSortChange={(sortKey) => handleSort(sortKey || "name")}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader sortKey="name" sortable scope="col">Navn</Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="type" sortable scope="col">Type</Table.ColumnHeader>
                        <Table.ColumnHeader scope="col">Beskrivelse</Table.ColumnHeader>

                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sortedList(displayList).map((item: TagListType, i) => {
                    return (
                        <Table.Row key={i + item.name}>
                            <Table.HeaderCell scope="row" className={css`width: 20%;`}>{item.name}</Table.HeaderCell>
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