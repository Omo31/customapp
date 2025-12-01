
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";

const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
    const db = useFirestore();
    
    const { data: initialData, loading: initialLoading } = useCollection<Order>(db, "orders", {
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

    const { data: orders, loading: paginatedLoading } = useCollection<Order>(db, "orders", {
        orderBy: ["createdAt", "desc"],
        limit: PAGE_SIZE,
        startAfter: startAfter
    });
    
    const loading = initialLoading || paginatedLoading;
    const currentOrders = currentPage > 1 ? orders : initialData;

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
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
          )}
          {!loading && currentOrders && (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.length > 0 ? currentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell><Badge>{order.status}</Badge></TableCell>
                      <TableCell className="text-right">₦{order.totalCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/orders/${order.id}`}>
                                  <Eye className="mr-0 h-4 w-4 md:mr-2" />
                                  <span className="hidden md:inline">Manage</span>
                              </Link>
                          </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No orders to display.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
  )
}
