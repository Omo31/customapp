
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
import { doc, updateDoc, DocumentData, DocumentSnapshot, query, where, or, orderBy } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Eye, Download, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot<DocumentData> | null)[]>([null]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { data: paginatedUsers, loading, error, lastDoc } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"],
    limit: PAGE_SIZE,
    startAfter: pageHistory[currentPage - 1]
  });

  const filteredUsers = useMemo(() => {
    if (!paginatedUsers) return [];
    if (!debouncedSearchTerm) return paginatedUsers;
    
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return paginatedUsers.filter(user => 
        user.firstName?.toLowerCase().includes(lowercasedTerm) ||
        user.lastName?.toLowerCase().includes(lowercasedTerm) ||
        user.email?.toLowerCase().includes(lowercasedTerm)
    );
  }, [paginatedUsers, debouncedSearchTerm]);


  const { data: allUsers, loading: allUsersLoading } = useCollection<UserProfile>(db, "users", {
    orderBy: ["createdAt", "desc"]
  });


  const handleNextPage = () => {
    if (lastDoc) {
        const newHistory = [...pageHistory, lastDoc];
        setPageHistory(newHistory);
        setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPageHistory(pageHistory.slice(0, -1));
      setCurrentPage(currentPage - 1);
    }
  };
  
  const canGoNext = paginatedUsers && paginatedUsers.length === PAGE_SIZE;


  const handleRoleChange = async (
    userId: string,
    role: string,
    isChecked: boolean | "indeterminate"
  ) => {
    if (typeof isChecked !== "boolean") return;

    const userToUpdate = paginatedUsers?.find((u) => u.id === userId);
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
      // A more robust solution might involve managing checkbox state separately.
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
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-2">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}
          {error && (
            <p className="text-destructive">
              Error loading users: {error.message}
            </p>
          )}
          {!loading && !error && (
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
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
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
                        No users found{debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}.
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
                        <PaginationPrevious onClick={handlePreviousPage} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} />
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
