

'use client';

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LayoutDashboard, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useFirestore, useCollection } from '@/firebase';
import { type Notification } from '@/types';
import { Badge } from '../ui/badge';
import { useMemo } from 'react';

export default function Header() {
  const { user, logout, isAdmin, roles } = useAuth();
  const db = useFirestore();

  // Query for user-specific notifications in their subcollection
  const { data: userNotifications } = useCollection<Notification>(
    db,
    user && !isAdmin ? `users/${user.uid}/notifications` : '',
    { where: ["isRead", "==", false] }
  );

  // Memoize the 'in' query array for admin roles to prevent re-renders
  const adminNotificationRoles = useMemo(() => {
    // Ensure roles are defined and not empty before creating the query
    return roles && roles.length > 0 ? roles : ['']; 
  }, [roles]);

  // Query for admin notifications where the 'role' field matches one of the admin's roles
  const { data: adminNotifications } = useCollection<Notification>(
    db,
    user && isAdmin ? 'notifications' : '',
    { where: ["role", "in", adminNotificationRoles] }
  );
  
  // Further filter admin notifications on the client for `isRead: false`
  const unreadAdminNotifications = useMemo(() => {
    return adminNotifications?.filter(n => !n.isRead) || [];
  }, [adminNotifications]);


  const unreadCount = isAdmin ? unreadAdminNotifications.length : (userNotifications?.length || 0);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <nav className="hidden md:flex items-center space-x-4">
            <Link href="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Products
            </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href={isAdmin ? "/admin/notifications" : "/account/notifications"}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} data-ai-hint="person face" />
                      <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                      <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>Admin</span>
                          </Link>
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
