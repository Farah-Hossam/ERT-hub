import type { UserRole } from "@/types/user.types";

export const roleLabels: Record<UserRole, string> = {
  member: "Member",
  department_head: "Department head",
  operations: "Operations",
  leadership: "Leadership",
  admin: "Admin",
};
