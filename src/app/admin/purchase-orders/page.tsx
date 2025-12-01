
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { PurchaseOrder } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, PlusCircle } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";

const PAGE_SIZE = 10;

export default function AdminPurchaseOrdersPage() {
    const db = useFirestore();
    
    const { data: initialData, loading: initialLoading } = useCollection<PurchaseOrder>(db, "purchaseOrders", {
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

    const { data: purchaseOrders, loading: paginatedLoading } = useCollection<PurchaseOrder>(db, "purchaseOrders", {
        orderBy: ["createdAt", "desc"],
        limit: PAGE_SIZE,
        startAfter: startAfter
    });

    const loading = initialLoading || paginatedLoading;
    const currentPurchaseOrders = currentPage > 1 ? purchaseOrders : initialData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-medium font-headline">Purchase Orders</h3>
            <p className="text-sm text-muted-foreground">Create and track orders placed with your suppliers.</p>
        </div>
        <Button asChild>
            <Link href="/admin/purchase-orders/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create PO
            </Link>
        </Button>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
          <CardDescription>A list of all purchase orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
             <div className="space-y-2">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
          )}
          {!loading && currentPurchaseOrders && (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPurchaseOrders.length > 0 ? currentPurchaseOrders.map(po => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">#{po.poNumber}</TableCell>
                      <TableCell>{po.supplier.name}</TableCell>
                      <TableCell>{new Date(po.issueDate?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell><Badge>{po.status}</Badge></TableCell>
                      <TableCell className="text-right">₦{po.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/purchase-orders/${po.id}`}>
                                  <Eye className="mr-0 h-4 w-4 md:mr-2" />
                                  <span className="hidden md:inline">View</span>
                              </Link>
                          </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">No purchase orders to display.</TableCell>
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
