
'use client'

import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuSkeleton, useSidebar } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth.tsx"
import { usePathname } from "next/navigation"
import { Home, User as UserIcon, LogOut, FileText, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function AppSidebar() {
    const { user, loading, logout } = useAuth()
    const { isMobile, setOpenMobile } = useSidebar()
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
                                onClick={handleLinkClick}
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
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/account')} onClick={handleLinkClick}>
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
                                }}>
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : null}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
