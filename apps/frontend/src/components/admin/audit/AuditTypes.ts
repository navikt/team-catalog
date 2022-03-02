export interface AuditItem {
  action: AuditAction;
  id: string;
  table: ObjectType;
  tableId: string;
  time: string;
  user: string;
  data: object;
}

export interface AuditLog {
  id: string;
  audits: AuditItem[];
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}

export enum ObjectType {
  Team = "Team",
  ProductArea = "ProductArea",
  Cluster = "Cluster",
  Resource = "Resource",
  Tag = "Tag",
  Settings = "Settings",
  Location = "Lokasjon"
}

export type NavigableItem = ObjectType
