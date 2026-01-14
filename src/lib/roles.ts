

// Defines roles that can be managed in the admin user interface.
// 'superadmin' is a special role that should only be managed by other superadmins.
export const allAdminRoles = [
  "dashboard",
  "orders",
  "quotes",
  "users",
  "purchase-orders",
  "accounting",
  "analytics",
  "notifications",
  "settings",
  "superadmin",
];

// All possible roles in the system, including special ones.
export const allRoles = [...allAdminRoles, "superadmin", "customer"];

// Navigation items for the admin sidebar. This controls what links appear.
// The `useAuth` hook uses these roles to filter the nav items based on user permissions.
export const allAdminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", role: "dashboard" },
  { title: "Orders", href: "/admin/orders", role: "orders" },
  { title: "Quotes", href: "/admin/quotes", role: "quotes" },
  { title: "Users", href: "/admin/users", role: "users" },
  { title: "Purchase Orders", href: "/admin/purchase-orders", role: "purchase-orders" },
  { title: "Accounting", href: "/admin/accounting", role: "accounting" },
  { title: "Analytics", href: "/admin/analytics", role: "analytics" },
  { title: "Notifications", href: "/admin/notifications", role: "notifications" },
  { title: "Settings", href: "/admin/settings", role: "settings" },
];

export function getRoleFromPath(path: string): string | undefined {
  const item = allAdminNavItems.find(item => path.startsWith(item.href));
  return item?.role;
}
