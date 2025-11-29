
"use client";

import { useFirestore, useCollection } from "@/firebase";
import { UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Eye } from "lucide-react";

export default function AdminUsersPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const { data: users, loading, error } = useCollection<UserProfile>(
    db,
    "users",
    {
      orderBy: ["firstName", "asc"],
    }
  );

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Users</h3>
        <p className="text-sm text-muted-foreground">
          Manage all registered users and their roles/permissions.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <p className="text-destructive">
              Error loading users: {error.message}
            </p>
          )}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Manage Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
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
                       <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No users to display.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
