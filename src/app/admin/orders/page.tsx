"use client"

import { useFirestore, useCollection } from "@/firebase";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersPage() {
    const db = useFirestore();
    const { data: orders, loading } = useCollection<Order>(db, "orders", {
        orderBy: ["createdAt", "desc"]
    });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Orders</h3>
        <p className="text-sm text-muted-foreground">Manage all customer orders from custom purchases.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A live list of all orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
          )}
          {!loading && orders && (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell><Badge>{order.status}</Badge></TableCell>
                      <TableCell className="text-right">₦{order.totalCost.toLocaleString()}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No orders to display.</TableCell>
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
