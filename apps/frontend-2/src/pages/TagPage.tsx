import { css } from "@emotion/css";
import { Table } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PageHeader } from "../components/PageHeader";
import type { Cluster, ProductArea, ProductTeam } from "../constants";
import { Status } from "../constants";
import { useAllClusters, useAllProductAreas, useAllTeams } from "../hooks";

export enum TagType {
  AREA = "Område",
  TEAM = "Team",
  CLUSTER = "Klynge",
}

type TagListType = {
  id: string;
  name: string;
  type: TagType;
  description: string;
};

const TagPage = () => {
  const parameters = useParams<{ id: string }>();
  const [status, setStatus] = useState<Status>(Status.ACTIVE);
  const [displayList, setDisplayList] = useState<TagListType[]>([]);

  const teamQuery = useAllTeams({ status });
  const teams = teamQuery.data ?? [];

  const productAreaQuery = useAllProductAreas({ status });
  const productAreas = productAreaQuery.data ?? [];

  const clusterQuery = useAllClusters({ status });
  const clusters = clusterQuery.data ?? [];

  const getUrl = (item: TagListType) => {
    if (item.type === TagType.AREA) return `/area/${item.id}`;

    return item.type === TagType.TEAM ? `/team/${item.id}` : `/cluster/${item.id}`;
  };

  useEffect(() => {
    const filteredTeams: TagListType[] = [...teams]
      .filter((t: ProductTeam) => parameters.id && t.tags.includes(parameters.id))
      .map((ft: ProductTeam) => ({
        id: ft.id,
        name: ft.name,
        type: TagType.TEAM,
        description: ft.description,
      }));
    const filteredAreas: TagListType[] = [...productAreas]
      .filter((p: ProductArea) => parameters.id && p.tags.includes(parameters.id))
      .map((fp: ProductArea) => ({
        id: fp.id,
        name: fp.name,
        type: TagType.AREA,
        description: fp.description,
      }));

    const filteredClusters: TagListType[] = [...clusters]
      .filter((c: Cluster) => parameters.id && c.tags.includes(parameters.id))
      .map((c: Cluster) => ({
        id: c.id,
        name: c.name,
        type: TagType.CLUSTER,
        description: c.description,
      }));

    setDisplayList([...filteredTeams, ...filteredAreas, ...filteredClusters]);
  }, [parameters, teams, productAreas, clusters]);

  return (
    <div>
      <PageHeader title={`Tagg: ${parameters.id}`} />

      <Table
        className={css`
          margin-top: 1rem;
        `}
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader scope="col">Navn</Table.ColumnHeader>
            <Table.ColumnHeader scope="col">Type</Table.ColumnHeader>
            <Table.ColumnHeader scope="col">Beskrivelse</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {displayList.map((item: TagListType, index) => {
            return (
              <Table.Row key={index + item.name}>
                <Table.DataCell
                  className={css`
                    width: 20%;
                  `}
                >
                  <Link to={getUrl(item)}>{item.name}</Link>
                </Table.DataCell>
                <Table.DataCell
                  className={css`
                    width: 25%;
                  `}
                >
                  {item.type}
                </Table.DataCell>
                <Table.DataCell>{item.description}</Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default TagPage;
