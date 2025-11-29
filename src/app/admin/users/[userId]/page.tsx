
"use client"

import { useFirestore, useDoc, useCollection } from "@/firebase";
import { UserProfile, Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailsPageProps {
  params: {
    userId: string;
  }
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
    const { userId } = params;
    const db = useFirestore();

    const { data: user, loading: userLoading } = useDoc<UserProfile>(db, "users", userId);
    
    const { data: orders, loading: ordersLoading } = useCollection<Order>(db, "orders", {
        where: ["userId", "==", userId],
        orderBy: ["createdAt", "desc"]
    });

    return (
        <div className="space-y-6">
             {userLoading ? (
                 <Skeleton className="h-32 w-full" />
             ) : user ? (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.photoURL} alt={`${user.firstName} ${user.lastName}`} data-ai-hint="person face" />
                            <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-headline">{user.firstName} {user.lastName}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map((role) => (
                                    <Badge key={role} variant="secondary" className="capitalize">
                                        {role.replace('-', ' ')}
                                    </Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline">No Roles</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>
             ) : (
                <p>User not found.</p>
             )}


            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>A list of all orders placed by this user.</CardDescription>
                </CardHeader>
                <CardContent>
                {ordersLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                )}
                {!ordersLoading && orders && (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {orders.length > 0 ? orders.map(order => (
                            <TableRow key={order.id}>
                            <TableCell className="font-medium">#...{order.id?.slice(-6)}</TableCell>
                            <TableCell>{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                            <TableCell><Badge>{order.status}</Badge></TableCell>
                            <TableCell className="text-right">₦{order.totalCost.toLocaleString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">This user has not placed any orders.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                )}
                </CardContent>
            </Card>
        </div>
    )
}
