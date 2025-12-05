
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";

const PAGE_SIZE = 10;

export default function OrdersPage() {
    const { user } = useAuth();
    const db = useFirestore();
    
    // This is the initial fetch, which also seeds the pagination hook
    const { data: initialData, loading: initialLoading } = useCollection<Order>(db, "orders", {
        where: ["userId", "==", user?.uid || " "], // Use a non-existent UID if user is not loaded
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

    // This query is now only for subsequent pages
    const { data: paginatedOrders, loading: paginatedLoading } = useCollection<Order>(db, "orders", {
        where: ["userId", "==", user?.uid || " "],
        orderBy: ["createdAt", "desc"],
        limit: PAGE_SIZE,
        startAfter: startAfter
    });

    // Determine the loading state and which data to display
    const loading = initialLoading || (currentPage > 1 && paginatedLoading);
    const currentOrders = currentPage > 1 ? paginatedOrders : initialData;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Order History</h3>
        <p className="text-sm text-muted-foreground">
          View details of all your past and current orders.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>A list of all your orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
             <div className="space-y-2">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
          )}
          {!loading && currentOrders && (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.length > 0 ? currentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#...{order.id?.slice(-6)}</TableCell>
                      <TableCell>{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell><Badge>{order.status}</Badge></TableCell>
                      <TableCell className="text-right">₦{order.totalCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                              <Link href={`/account/orders/${order.id}`}>
                                  <Eye className="mr-0 h-4 w-4 md:mr-2" />
                                  <span className="hidden md:inline">View</span>
                              </Link>
                          </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">You have no orders yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          )}
        </CardContent>
         {currentOrders && currentOrders.length > 0 && (
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
  )
}
