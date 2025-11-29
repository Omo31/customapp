'use client'

import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"
import { Home, Palette, LayoutDashboard, User as UserIcon, LogOut, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"

export default function AppSidebar() {
    const { user, logout } = useAuth()
    const pathname = usePathname()
  
    const navLinks = [
        { href: '/', label: 'Home', icon: <Home />, protected: false },
        { href: '/generate', label: 'Generate', icon: <Palette />, protected: true },
        { href: '/gallery', label: 'Gallery', icon: <LayoutDashboard />, protected: true },
    ];
    
    return (
        <Sidebar>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navLinks.map(link => {
                        if (link.protected && !user) return null;
                        return (
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
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                {user ? (
                    <SidebarMenu>
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
                    </SidebarMenu>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Button asChild>
                            <Link href="/login">
                                <LogIn className="mr-2" />
                                Login
                            </Link>
                        </Button>
                         <Button asChild variant="secondary">
                            <Link href="/signup">
                                <UserPlus className="mr-2" />
                                Sign Up
                            </Link>
                        </Button>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
