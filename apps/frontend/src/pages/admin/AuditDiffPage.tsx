import { css } from "@emotion/css";
import { Button } from "@navikt/ds-react";
import { useState } from "react";
import ReactJsonViewCompare from "react-json-view-compare";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { auditLogKeys, getAuditLog } from "../../api/adminApi";

export function AuditDiffPage() {
  const auditId = useParams<{ auditId: string }>().auditId as string;
  const [index, setIndex] = useState(0);

  const auditLogQuery = useQuery({
    queryKey: auditLogKeys.id(auditId),
    queryFn: () => getAuditLog(auditId),
  });

  const audit0 = auditLogQuery.data?.audits[index]?.data?.data ?? {};
  const audit1 = auditLogQuery.data?.audits[index + 1]?.data?.data ?? {};

  return (
    <div
      className={css`
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
      <Button onClick={() => setIndex(index - 1)}>Tilbake</Button>
      <Button onClick={() => setIndex(index + 1)}>Frem</Button>
      <ReactJsonViewCompare newData={audit0} oldData={audit1} />
    </div>
  );
}
