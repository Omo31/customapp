'use client'

import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuSkeleton } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth.tsx"
import { usePathname } from "next/navigation"
import { Home, User as UserIcon, LogOut, FileText, Package } from "lucide-react"
import Link from "next/link"

export default function AppSidebar() {
    const { user, loading, logout } = useAuth()
    const pathname = usePathname()
  
    const navLinks = [
        { href: '/', label: 'Home', icon: <Home />, protected: false },
        { href: '/custom-order', label: 'Custom Order', icon: <FileText />, protected: false },
    ];
    
    return (
        <Sidebar>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navLinks.map(link => (
                        <SidebarMenuItem key={link.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === link.href}
                            >
                                <Link href={link.href}>
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarMenu>
                    {loading && (
                        <>
                            <SidebarMenuSkeleton showIcon={true} />
                            <SidebarMenuSkeleton showIcon={true} />
                        </>
                    )}
                    {!loading && user && (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/account')}>
                                    <Link href="/account/profile">
                                        <UserIcon />
                                        <span>Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton onClick={logout}>
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
