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
        Historikk: {firstAudit?.data.type} - {firstAudit?.data.data.name}
      </Heading>
      <div
        className={css(
          css`
            display: flex;
            gap: 1rem;
            height: 700px;

            > div {
              overflow-y: scroll;
              height: 700px;
              width: 50%;
            }

            div:nth-of-type(2) {
              padding: var(--a-spacing-3) 0;
            }
          `,
          JSON_VIEW_CSS_OVERRIDES,
        )}
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
              <ReactJsonViewCompare
                newData={newestAudit?.data.data ?? oldestAudit.data.data}
                oldData={oldestAudit.data.data}
              />
            </div>
          </div>
        ) : (
          <div>Velg to versjoner for å sammenligne</div>
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

const JSON_VIEW_CSS_OVERRIDES = css`
  pre {
    margin: 0;
  }

  .c-json-view {
    background: var(--a-gray-200);
  }

  .c-line-add {
    background: var(--a-green-500);
  }

  .c-of-add::after {
    color: var(--a-green-200);
  }

  .c-line-del {
    background: var(--a-red-500);
  }

  .c-of-del::after {
    color: var(--a-red-200);
  }

  .c-json-key,
  .c-json-comma {
    color: var(--a-deepblue-500) !important;
  }

  .c-json-string,
  .c-json-number {
    color: black;
  }

  .c-line-add,
  .c-line-del {
    .c-json-string,
    .c-json-number {
      color: var(--a-white) !important;
    }

    .c-json-key,
    .c-json-comma {
      color: black !important;
    }
  }

  .c-json-null,
  .c-json-boolean,
  .c-json-undefined,
  .c-json-regexp,
  .c-json-date,
  .c-json-set,
  .c-json-map,
  .c-json-error,
  .c-json-symbol,
  .c-json-function {
    color: white;
    background: var(--a-grayalpha-500);
    border: none;
  }
`;
