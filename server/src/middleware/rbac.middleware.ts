type Role = "user" | "admin" | "moderator";

const ROLE_HIERARCHY: Record<Role, number> = {
  user: 1,
  moderator: 2,
  admin: 3,
};

export function requireRole(minRole: Role) {
  return (ctx: { userRole?: string }) => {
    const userLevel = ROLE_HIERARCHY[ctx.userRole as Role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];
    if (userLevel < requiredLevel) throw new Error("Insufficient permissions");
  };
}

export const rbac = {
  requireUser: requireRole("user"),
  requireModerator: requireRole("moderator"),
  requireAdmin: requireRole("admin"),
};