

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

// All roles that can be managed by an admin.
export const allAdminRoles = allAdminNavItems.map(item => item.role);

// All possible roles in the system, including special ones.
export const allRoles = [...allAdminRoles, "superadmin", "customer"];

export function getRoleFromPath(path: string): string | undefined {
  const item = allAdminNavItems.find(item => item.href === path);
  return item?.role;
}
