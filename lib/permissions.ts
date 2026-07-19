export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export type PermissionAction =
  | "read:dashboard"
  | "read:feedback"
  | "write:feedback"   // Ingest feedback, change status, reclassify
  | "read:reports"
  | "write:reports"  // Generate VoC reports
  | "manage:users";     // Invite members, change roles

const ROLE_PERMISSIONS: Record<Role, PermissionAction[]> = {
  ADMIN: [
    "read:dashboard",
    "read:feedback",
    "write:feedback",
    "read:reports",
    "write:reports",
    "manage:users",
  ],
  ANALYST: [
    "read:dashboard",
    "read:feedback",
    "write:feedback",
    "read:reports",
    "write:reports",
  ],
  VIEWER: [
    "read:dashboard",
    "read:feedback",
    "read:reports",
  ],
};

export function hasPermission(
  userRole: string | undefined | null,
  action: PermissionAction
): boolean {
  if (!userRole) return false;
  const role = userRole as Role;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(action) : false;
}

export function assertPermission(
  userRole: string | undefined | null,
  action: PermissionAction
): void {
  if (!hasPermission(userRole, action)) {
    throw new Error("Forbidden: Insufficient permissions");
  }
}
