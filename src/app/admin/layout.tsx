'use client'

import ProtectedRoute from "@/components/auth/protected-route"
import { Nav } from "@/components/account-admin/nav"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const adminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard" },
  { title: "Orders", href: "/admin/orders" },
  { title: "Quotes", href: "/admin/quotes" },
  { title: "Users", href: "/admin/users" },
  { title: "Purchase Orders", href: "/admin/purchase-orders" },
  { title: "Accounting", href: "/admin/accounting" },
  { title: "Analytics", href: "/admin/analytics" },
  { title: "Notifications", href: "/admin/notifications" },
  { title: "Settings", href: "/admin/settings" },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminArea({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user?.isAdmin) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user?.isAdmin) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Verifying permissions...</p>
        </div>
    )
  }

  return (
    <div className="container space-y-8 p-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <Nav items={adminNavItems} title="Admin Panel" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}


export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <AdminArea>{children}</AdminArea>
    </ProtectedRoute>
  )
}
