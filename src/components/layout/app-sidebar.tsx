
'use client'

import { 
    Sidebar, 
    SidebarHeader, 
    SidebarContent, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, 
    SidebarFooter, 
    SidebarMenuSkeleton, 
    useSidebar,
    SidebarRail
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth.tsx"
import { usePathname } from "next/navigation"
import { Home, User as UserIcon, LogOut, FileText, ShoppingCart, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function AppSidebar() {
    const { user, loading, logout, isAdmin } = useAuth()
    const { isMobile, setOpenMobile, state } = useSidebar()
    const pathname = usePathname()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }
  
    const navLinks = [
        { href: '/', label: 'Home', icon: <Home />, protected: false },
        { href: '/products', label: 'Products', icon: <ShoppingCart />, protected: false },
        { href: '/custom-order', label: 'Custom Order', icon: <FileText />, protected: false },
    ];
    
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <Logo hideText={state === 'collapsed'} />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navLinks.map(link => (
                        <SidebarMenuItem key={link.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === link.href}
                                onClick={handleLinkClick}
                                tooltip={link.label}
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
                    {!isClient || loading ? (
                        <>
                            <SidebarMenuSkeleton showIcon={true} />
                            <SidebarMenuSkeleton showIcon={true} />
                        </>
                    ) : user ? (
                        <>
                            {isAdmin && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')} onClick={handleLinkClick} tooltip="Admin Panel">
                                        <Link href="/admin/dashboard">
                                            <LayoutDashboard />
                                            <span>Admin Panel</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/account')} onClick={handleLinkClick} tooltip="My Account">
                                    <Link href="/account/profile">
                                        <UserIcon />
                                        <span>Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton onClick={() => {
                                    logout();
                                    handleLinkClick();
                                }} tooltip="Logout">
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : null}
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
