import ProtectedRoute from "@/components/auth/protected-route"
import { Nav } from "@/components/account-admin/nav"

const accountNavItems = [
  { title: "Profile", href: "/account/profile" },
  { title: "Order History", href: "/account/orders" },
  { title: "My Quotes", href: "/account/quotes" },
  { title: "Notifications", href: "/account/notifications" },
]

interface AccountLayoutProps {
  children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="container space-y-8 p-8">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <Nav items={accountNavItems} title="My Account" />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
