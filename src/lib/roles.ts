
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

// Combine nav roles with special roles like 'superadmin'
const navRoles = allAdminNavItems.map(item => item.role);
const specialRoles = ["superadmin"];

export const allAdminRoles = [...navRoles, ...specialRoles];

export function getRoleFromPath(path: string): string | undefined {
  const item = allAdminNavItems.find(item => item.href === path);
  return item?.role;
}
