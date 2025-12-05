
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
import { Eye, Download } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import ProtectedRoute from "@/components/auth/protected-route";


const PAGE_SIZE = 10;

function AdminUsersContent() {
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const { data: initialData, loading: initialLoading } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"],
    limit: PAGE_SIZE,
  });

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
  });
  
  const { data: allUsers, loading: allUsersLoading } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"]
  });

  const loading = currentPage === 1 ? initialLoading : paginatedLoading;
  const currentUsers = currentPage > 1 ? users : initialData;


  const handleRoleChange = async (
    userId: string,
    role: string,
    isChecked: boolean | "indeterminate"
  ) => {
    if (typeof isChecked !== "boolean") return;

    const userToUpdate = users?.find((u) => u.id === userId);
    if (!userToUpdate) return;

    // Prevent superadmin roles from being changed
    if (userToUpdate.email === 'oluwagbengwumi@gmail.com') {
      toast({
        title: "Action Forbidden",
        description: "Cannot change the roles of the superadmin.",
        variant: "destructive"
      });
      // We need to trigger a re-render to revert the checkbox state visually
      // This is a bit of a hack, but it works without complex state management.
      router.refresh(); 
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
          {loading && (
            <div className="space-y-2">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}
          {!loading && currentUsers && (
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
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
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
                                  disabled={user.email === 'oluwagbengwumi@gmail.com'}
                                />
                                <Label htmlFor={`${user.id}-${role}`} className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {role.replace('-', ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
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
