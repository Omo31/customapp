

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
import { Eye, Download, UserX, ShieldBan } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import ProtectedRoute from "@/components/auth/protected-route";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";


const PAGE_SIZE = 10;

function AdminUsersContent() {
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser, hasRole } = useAuth();

  // This state is used as a key to force a re-render of the useCollection hooks,
  // ensuring we get fresh data after a role change reverts.
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: initialData, loading: initialLoading, error } = useCollection<UserProfile>(db, "users", {
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

  const { data: users, loading: paginatedLoading } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"],
    limit: PAGE_SIZE,
    startAfter: startAfter
  }, [refreshKey, startAfter]);
  
  const { data: allUsers, loading: allUsersLoading } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"]
  }, [refreshKey]);

  const loading = initialLoading || paginatedLoading;
  const currentUsers = currentPage > 1 ? users : initialData;


  const handleRoleChange = async (
    userId: string,
    role: string,
    isChecked: boolean | "indeterminate"
  ) => {
    if (typeof isChecked !== "boolean" || !currentUser) return;

    const userToUpdate = currentUsers?.find((u) => u.id === userId);
    if (!userToUpdate) return;
    
    // Prevent non-superadmins from changing superadmin role
    if (role === 'superadmin' && !hasRole('superadmin')) {
      toast({
        title: "Action Forbidden",
        description: "Only a superadmin can grant or revoke the superadmin role.",
        variant: "destructive"
      });
      setRefreshKey(prev => prev + 1);
      return;
    }
    
    // Prevent user from removing their own 'users' role and locking themselves out
    if (userId === currentUser.uid && role === 'users' && !isChecked) {
        toast({
            title: "Action Prevented",
            description: "You cannot remove your own 'Users' management role.",
            variant: "destructive"
        });
        setRefreshKey(prev => prev + 1); // Revert checkbox
        return;
    }

    const currentRoles = userToUpdate.roles || [];
    let newRoles: string[];

    if (isChecked) {
      newRoles = [...currentRoles, role];
    } else {
      newRoles = currentRoles.filter((r) => r !== role);
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { roles: newRoles });
      toast({
        title: "Roles Updated",
        description: `Successfully updated roles for ${userToUpdate.firstName}.`,
      });
    } catch (e: any) {
      console.error("Error updating roles: ", e);
      toast({
        title: "Error",
        description: "Failed to update roles. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisableUser = async (userId: string, isDisabled: boolean) => {
     const userToUpdate = currentUsers?.find((u) => u.id === userId);
     if (!userToUpdate) return;

     if (userToUpdate.roles.includes('superadmin') && !hasRole('superadmin')) {
        toast({ title: "Action Forbidden", description: "The superadmin account cannot be disabled by a non-superadmin.", variant: "destructive" });
        setRefreshKey(prev => prev + 1);
        return;
     }

     try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { disabled: isDisabled });
        toast({
            title: `User ${isDisabled ? 'Disabled' : 'Enabled'}`,
            description: `${userToUpdate.firstName} has been ${isDisabled ? 'disabled' : 'enabled'}.`,
        });
     } catch (error) {
        toast({ title: "Error", description: "Could not update user status.", variant: "destructive" });
     }
  }

  const handleDownloadCsv = () => {
    if (!allUsers) {
        toast({ title: 'No user data to download.', variant: 'destructive' });
        return;
    }

    const headers = ['First Name', 'Last Name', 'Email', 'Roles', 'Joined On'];
    const csvRows = [headers.join(',')];

    allUsers.forEach(user => {
        const row = [
            `"${user.firstName}"`,
            `"${user.lastName}"`,
            `"${user.email}"`,
            `"${(user.roles || []).join(', ')}"`,
            `"${user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toISOString() : 'N/A'}"`
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'users.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-medium font-headline">Users</h3>
            <p className="text-sm text-muted-foreground">
            Manage all registered users and their roles/permissions.
            </p>
        </div>
        <Button onClick={handleDownloadCsv} disabled={allUsersLoading || !allUsers}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A paginated list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !currentUsers ? (
            <div className="space-y-2">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Manage Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers && currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <TableRow key={user.id} className={user.disabled ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">
                          <div className="font-medium flex items-center gap-2">
                            {user.disabled && <UserX className="h-4 w-4 text-destructive" />}
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground md:hidden">{user.email}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-col md:flex-row md:flex-wrap gap-x-4 gap-y-2">
                            {allAdminRoles.map((role) => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${user.id}-${role}`}
                                  checked={user.roles?.includes(role)}
                                  onCheckedChange={(isChecked) =>
                                    handleRoleChange(user.id!, role, isChecked)
                                  }
                                  disabled={role === 'superadmin' && !hasRole('superadmin')}
                                />
                                <Label htmlFor={`${user.id}-${role}`} className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {role.replace('-', ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Switch
                            aria-label={`Disable user ${user.firstName}`}
                            checked={!!user.disabled}
                            onCheckedChange={(isChecked) => handleDisableUser(user.id!, isChecked)}
                            disabled={user.roles?.includes('superadmin') && !hasRole('superadmin')}
                           />
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/users/${user.id}`}>
                              <Eye className="mr-0 h-4 w-4 md:mr-2" />
                              <span className="hidden md:inline">View</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No users found.
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
                        <span className="p-2 text-sm">Page {currentPage}</span>
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
