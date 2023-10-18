import { css } from "@emotion/css";
import { Checkbox, Heading, Table } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import sortBy from "lodash/sortBy";
import React, { useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- types does not exist for this package
import ReactJsonViewCompare from "react-json-view-compare";
import { useParams } from "react-router-dom";

import { auditLogKeys, getAuditLog } from "../../api/adminApi";
import type { AuditItem } from "../../constants";

export function AuditDiffPage() {
  const auditId = useParams<{ auditId: string }>().auditId as string;

  const [checkedRows, setCheckedRows] = useState<string[]>([]);

  const auditLogQuery = useQuery({
    queryKey: auditLogKeys.id(auditId),
    queryFn: () => getAuditLog(auditId),
  });

  const firstAudit = auditLogQuery.data?.audits[0];

  const matchingAudits = auditLogQuery.data?.audits.filter((audit) => checkedRows.includes(audit.id)) ?? [];
  const [oldestAudit, newestAudit] = sortBy(matchingAudits, "time");

  return (
    <>
      <Heading size="medium" spacing>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/*@ts-ignore*/}
        Historikk: {firstAudit?.data.type} - {firstAudit?.data.data.name}
      </Heading>
      <div
        className={css`
          display: flex;
          gap: 1rem;
          height: 700px;

          > div {
            overflow-y: scroll;
            height: 700px;
            width: 50%;
          }
        `}
      >
        <div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">Velg</Table.HeaderCell>
                <Table.HeaderCell scope="col">Tidspunkt</Table.HeaderCell>
                <Table.HeaderCell scope="col">Bruker</Table.HeaderCell>
                <Table.HeaderCell scope="col">Handling</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(auditLogQuery.data?.audits ?? []).map((audit) => (
                <Table.Row key={audit.id}>
                  <Table.DataCell>
                    <Checkbox
                      checked={checkedRows.includes(audit.id)}
                      disabled={checkedRows.length >= 2 && !checkedRows.includes(audit.id)}
                      hideLabel
                      onChange={() =>
                        setCheckedRows((checkedRows) => {
                          const rowIsAlreadyChecked = checkedRows.includes(audit.id);
                          if (rowIsAlreadyChecked) {
                            return checkedRows.filter((row) => row !== audit.id);
                          }
                          return [audit.id, ...checkedRows];
                        })
                      }
                    >
                      Velg
                    </Checkbox>
                  </Table.DataCell>
                  <Table.DataCell>{dayjs(audit.time).format("DD.MM.YYYY HH:mm")}</Table.DataCell>
                  <Table.DataCell>{audit.user}</Table.DataCell>
                  <Table.DataCell>{audit.action}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        {checkedRows.length > 0 ? (
          <div>
            <JsonViewTitle newestAudit={newestAudit} oldestAudit={oldestAudit} />
            <div>
              <ReactJsonViewCompare newData={newestAudit ?? oldestAudit} oldData={oldestAudit} />
            </div>
          </div>
        ) : (
          <div>Velg 2 versjoner for å se diff</div>
        )}
      </div>
    </>
  );
}

function JsonViewTitle({ oldestAudit, newestAudit }: { oldestAudit?: AuditItem; newestAudit?: AuditItem }) {
  if (oldestAudit && !newestAudit) {
    return (
      <div>
        Viser hvordan objektet så ut <b>{dayjs(oldestAudit.time).format("DD.MM.YYYY HH:mm")}</b>
      </div>
    );
  }

  if (oldestAudit && newestAudit) {
    return (
      <div>
        Viser hva som skjedde fra <b>{dayjs(oldestAudit.time).format("DD.MM.YYYY HH:mm")}</b> til{" "}
        <b>{dayjs(newestAudit?.time).format("DD.MM.YYYY HH:mm")}</b>
      </div>
    );
  }

  return <></>;
}
