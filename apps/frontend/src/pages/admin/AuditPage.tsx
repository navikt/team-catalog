import { AuditRecentTable } from "../../components/admin/AuditRecentTable";
import { PageHeader } from "../../components/PageHeader";
import { Group, userHasGroup, useUser } from "../../hooks";

export const AuditPage = () => {
  const user = useUser();

  if (!userHasGroup(user, Group.ADMIN)) {
    return <>Fant ikke siden.</>;
  }

  return (
    <div>
      <PageHeader title="Versjonering" />
      <AuditRecentTable />
    </div>
  );
};
