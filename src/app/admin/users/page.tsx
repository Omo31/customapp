
"use client";

import { useFirestore, useCollection } from "@/firebase";
import { UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { allAdminRoles } from "@/lib/roles";
import { doc, updateDoc } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Eye, ShieldCheck, RefreshCcw, Loader2 } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import ProtectedRoute from "@/components/auth/protected-route";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 20;

function AdminUsersContent() {
  const db = useFirestore();
  const { toast } = useToast();
  const { user: currentUser, hasRole } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // The query should list all users. No filter on ID.
  const { data: initialData, loading: initialLoading } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"],
    limit: PAGE_SIZE,
  }, [refreshKey]);

  const {
    currentPage,
    handleNextPage,
    handlePreviousPage,
    canGoNext,
    canGoPrevious,
    startAfter,
  } = usePagination({ data: initialData, pageSize: PAGE_SIZE });

  const { data: paginatedUsers, loading: paginatedLoading } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"],
    limit: PAGE_SIZE,
    startAfter: startAfter,
  }, [refreshKey, startAfter]);
  
  const loading = initialLoading || paginatedLoading;
  const currentUsers = currentPage > 1 ? paginatedUsers : initialData;

  const handleRoleChange = async (
    userId: string,
    role: string,
    isChecked: boolean | "indeterminate"
  ) => {
    if (typeof isChecked !== "boolean" || !currentUser) return;

    const userToUpdate = currentUsers?.find((u) => u.id === userId);
    if (!userToUpdate) return;
    
    if (role === 'superadmin' && !hasRole('superadmin')) {
      toast({
        title: "Permission Denied",
        description: "Only a Superadmin can manage the Superadmin role.",
        variant: "destructive"
      });
      return;
    }

    const currentRoles = userToUpdate.roles || [];
    let newRoles: string[];

    if (isChecked) {
      newRoles = Array.from(new Set([...currentRoles, role]));
    } else {
      newRoles = currentRoles.filter((r) => r !== role);
    }
    
    if (newRoles.length === 0) newRoles.push('customer');

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { roles: newRoles });
      toast({
        title: "Roles Updated",
        description: `Permissions for ${userToUpdate.firstName} have been saved.`,
      });
    } catch (e: any) {
      console.error("Error updating roles:", e);
      toast({
        title: "Update Failed",
        description: "An error occurred while saving roles.",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, isDisabled: boolean) => {
     const userToUpdate = currentUsers?.find((u) => u.id === userId);
     if (!userToUpdate) return;

     if (userToUpdate.roles?.includes('superadmin') && !hasRole('superadmin')) {
        toast({ title: "Action Forbidden", description: "Superadmins cannot be disabled.", variant: "destructive" });
        return;
     }

     try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { disabled: isDisabled });
        toast({
            title: isDisabled ? 'User Disabled' : 'User Enabled',
            description: `${userToUpdate.firstName} is now ${isDisabled ? 'restricted' : 'active'}.`,
        });
     } catch (error) {
        toast({ title: "Error", description: "Could not update user status.", variant: "destructive" });
     }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-2xl font-bold font-headline">User Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage permissions, roles, and account access for all registered users.
            </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            Refresh
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>Assign administrative roles to grant access to different panel sections.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !currentUsers ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Roles</TableHead>
                    <TableHead>Manage Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers && currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <TableRow key={user.id} className={user.disabled ? "bg-muted/50" : ""}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold flex items-center gap-2">
                                {user.firstName} {user.lastName}
                                {user.roles?.includes('superadmin') && <ShieldCheck className="h-4 w-4 text-primary" />}
                            </span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {user.roles?.map(role => (
                                    <Badge key={role} variant={role === 'superadmin' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                                        {role.replace('-', ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 min-w-[300px]">
                            {allAdminRoles.map((role) => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${user.id}-${role}`}
                                  checked={user.roles?.includes(role)}
                                  onCheckedChange={(isChecked) =>
                                    handleRoleChange(user.id!, role, isChecked)
                                  }
                                  disabled={
                                    (role === 'superadmin' && !hasRole('superadmin')) ||
                                    (user.id === currentUser?.uid && role === 'users')
                                  }
                                />
                                <Label htmlFor={`${user.id}-${role}`} className="text-[11px] capitalize cursor-pointer">
                                  {role.replace('-', ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Switch
                                checked={!!user.disabled}
                                onCheckedChange={(checked) => handleToggleUserStatus(user.id!, checked)}
                                disabled={user.roles?.includes('superadmin') || user.id === currentUser?.uid}
                                title={user.disabled ? "Enable User" : "Disable User"}
                             />
                             <Button asChild variant="ghost" size="sm">
                                <Link href={`/admin/users/${user.id}`}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found. Try refreshing or check security rules.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         {currentUsers && currentUsers.length > 0 && (
          <CardFooter>
              <Pagination>
                  <PaginationContent>
                      <PaginationItem>
                          <PaginationPrevious onClick={handlePreviousPage} aria-disabled={!canGoPrevious} className={!canGoPrevious ? "pointer-events-none opacity-50" : undefined} />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 text-sm font-medium text-muted-foreground">Page {currentPage}</span>
                      </PaginationItem>
                      <PaginationItem>
                          <PaginationNext onClick={handleNextPage} aria-disabled={!canGoNext} className={!canGoNext ? "pointer-events-none opacity-50" : undefined} />
                      </PaginationItem>
                  </PaginationContent>
              </Pagination>
          </CardFooter>
         )}
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
    return (
        <ProtectedRoute requiredRole="users">
            <AdminUsersContent />
        </ProtectedRoute>
    )
}
