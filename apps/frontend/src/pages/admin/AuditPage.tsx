import { css } from "@emotion/css";
import { Label, TextField } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getAuditLog } from "../../api/adminApi";
import { AuditRecentTable } from "../../components/admin/AuditRecentTable";
import { PageHeader } from "../../components/PageHeader";
import type { AuditLog } from "../../constants";
import { Group, useDebouncedState, userHasGroup, useUser } from "../../hooks";

export const AuditPage = () => {
  const parameters = useParams<{ id?: string; auditId?: string }>();
  const navigate = useNavigate();

  const [auditLog, setAuditLog] = useState<AuditLog>();
  const [idSearch, setIdInput, idInput] = useDebouncedState(parameters.id || "", 400);

  const user = useUser();

  const lookupVersion = (id?: string) => {
    (async () => {
      if (id === auditLog?.id) {
        return;
      }
      setAuditLog(undefined);
      if (!id) {
        !!parameters.id && navigate("/admin/audit");
        return;
      }

      try {
        const log = await getAuditLog(id);

        setAuditLog(log);

        if (log.audits.length > 0 && id !== parameters.id) {
          navigate(`/admin/audit/${id}`);
        }
      } catch {
        /* empty */
      }
    })();
  };

  useEffect(() => setIdInput(parameters.id || ""), [parameters.id]);
  useEffect(() => lookupVersion(idSearch), [idSearch]);

  if (!userHasGroup(user, Group.ADMIN)) {
    return <>Fant ikke siden.</>;
  }

  return (
    <div>
      <PageHeader title="Versjonering" />

      <div
        className={css`
          display: flex;
          margin-bottom: 1rem;
          margin-top: 1rem;
          gap: 2rem;
          width: 500px;
        `}
      >
        <Label>Søk etter id</Label>
        <TextField
          className={css`
            width: 300px;
          `}
          hideLabel
          label=""
          onChange={(event) => setIdInput(event.currentTarget.value)}
          size="small"
          value={idInput}
        />
      </div>

      <AuditRecentTable show={!idInput} />
    </div>
  );
};
