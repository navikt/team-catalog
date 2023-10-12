import { css } from "@emotion/css";
import { Checkbox, Table } from "@navikt/ds-react";
import dayjs from "dayjs";
import sortBy from "lodash/sortBy";
import React, { useState } from "react";
import ReactJsonViewCompare from "react-json-view-compare";
import { useQuery } from "react-query";
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

  const matchingAudits = auditLogQuery.data?.audits.filter((audit) => checkedRows.includes(audit.id)) ?? [];
  const [oldestAudit, newestAudit] = sortBy(matchingAudits, "time");

  return (
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
        //.c-line-none {
        //  display: none; /* Hide all elements with class A by default */
        //}
        //
        //.c-line-add + .c-line-none, /* Select class A that follows a sibling with class B */
        //.c-line-del + .c-line-none /* Select class A that follows a sibling with class C */ {
        //  display: block; /* Display class A when it follows a sibling with class B or C */
        //}
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
