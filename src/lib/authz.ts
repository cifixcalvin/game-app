import type { Role } from "./constants";

export const PERMISSIONS = {
  super_admin: [
    "tournament:view",
    "tournament:create",
    "tournament:edit",
    "tournament:delete",
    "tournament:publish",
    "registration:view",
    "registration:update",
    "registration:export",
    "admin:manage",
  ],
  admin: [
    "tournament:view",
    "tournament:create",
    "tournament:edit",
    "tournament:delete",
    "tournament:publish",
    "registration:view",
    "registration:update",
    "registration:export",
  ],
  editor: [
    "tournament:view",
    "tournament:create",
    "tournament:edit",
    "registration:view",
  ],
} as const satisfies Record<Role, readonly string[]>;

export type Permission = (typeof PERMISSIONS)[Role][number];

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[role] as readonly string[]).includes(permission);
}
