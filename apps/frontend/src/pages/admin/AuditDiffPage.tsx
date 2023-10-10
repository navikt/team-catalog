import ReactJsonViewCompare from "react-json-view-compare";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { auditLogKeys, getAuditLog } from "../../api/adminApi";

export function AuditDiffPage() {
  const auditId = useParams<{ auditId: string }>().auditId as string;

  const auditLogQuery = useQuery({
    queryKey: auditLogKeys.id(auditId),
    queryFn: () => getAuditLog(auditId),
  });

  const audit0 = auditLogQuery.data?.audits[0]?.data?.data;
  const audit1 = auditLogQuery.data?.audits[1]?.data?.data;

  return (
    <div>
      <ReactJsonViewCompare newData={audit0} oldData={audit1} />
    </div>
  );
}
