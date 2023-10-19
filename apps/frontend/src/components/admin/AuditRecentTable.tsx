import { css } from "@emotion/css";
import { Label, Pagination, Table } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { auditKeys, getAudits } from "../../api/adminApi";
import { ObjectType } from "../../constants";
import { BasicSelect, SelectLayoutWrapper } from "../select/CustomSelectComponents";

dayjs.extend(relativeTime);

export const AuditRecentTable = () => {
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [table, setTable] = useState<ObjectType | undefined>(undefined);

  const pageInfo = { page, count: limit, table };

  const auditLogQuery = useQuery({
    queryKey: auditKeys.page(pageInfo),
    queryFn: () => getAudits(pageInfo),
  });

  const numberOfPages = auditLogQuery.data?.pages ?? 0;

  useEffect(() => {
    setPage(0);
  }, [table]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0) {
      return;
    }
    if (nextPage > numberOfPages) {
      return;
    }

    setPage(nextPage);
  };

  const auditTypeOptions = Object.keys(ObjectType).map((ot) => ({ value: ot, label: ot }));

  return (
    <>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          margin-bottom: 1rem;
          align-items: center;
        `}
      >
        <Label>Siste endringer</Label>

        <div
          className={css`
            min-width: 400px;
          `}
        >
          <SelectLayoutWrapper htmlFor="Tabellnavn" label="Tabellnavn">
            <BasicSelect
              inputId="Tabellnavn"
              onChange={(p) => setTable(p?.value as ObjectType)}
              options={auditTypeOptions}
              value={auditTypeOptions.find((option) => option.value === table)}
            />
          </SelectLayoutWrapper>
        </div>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Tidspunkt</Table.HeaderCell>
            <Table.HeaderCell scope="col">Handling</Table.HeaderCell>
            <Table.HeaderCell scope="col">Type</Table.HeaderCell>
            <Table.HeaderCell scope="col">Versjons Id</Table.HeaderCell>
            <Table.HeaderCell scope="col">Bruker</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {auditLogQuery.data?.content.map((audit, index) => {
            return (
              <Table.Row key={index + audit.id}>
                <Table.HeaderCell scope="row">{dayjs(audit.time).fromNow(true)} siden</Table.HeaderCell>
                <Table.DataCell>{audit.action}</Table.DataCell>
                <Table.DataCell>{audit.table}</Table.DataCell>
                <Table.DataCell>
                  <Link to={`${audit.tableId}/diff`}>{audit.tableId}</Link>
                </Table.DataCell>
                <Table.DataCell>{audit.user}</Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <div
        className={css`
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        `}
      >
        {numberOfPages > 0 ? (
          <Pagination
            boundaryCount={1}
            count={numberOfPages}
            onPageChange={(x) => handlePageChange(x - 1)}
            page={page + 1}
            siblingCount={1}
          />
        ) : undefined}
      </div>
    </>
  );
};
