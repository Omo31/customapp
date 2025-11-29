'use client'

import ProtectedRoute from "@/components/auth/protected-route"
import { Nav } from "@/components/account-admin/nav"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { allAdminNavItems, getRoleFromPath } from "@/lib/roles"

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminArea({ children }: AdminLayoutProps) {
  const { user, loading, roles, hasRole } = useAuth()
  const router = useRouter()
  
  const accessibleNavItems = useMemo(() => {
    return allAdminNavItems.filter(item => {
      const role = getRoleFromPath(item.href);
      return role ? hasRole(role) : true; // Dashboard is always visible if user is admin
    });
  }, [roles, hasRole]);

  useEffect(() => {
    if (!loading) {
      if (!user || roles.length === 0) {
        router.push('/')
      }
    }
  }, [user, roles, loading, router])

  if (loading || !user || roles.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Verifying permissions...</p>
        </div>
    )
  }

  return (
    <div className="container space-y-8 p-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <Nav items={accessibleNavItems} title="Admin Panel" />
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
