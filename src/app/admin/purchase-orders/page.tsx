
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { PurchaseOrder } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, PlusCircle } from "lucide-react";

const PAGE_SIZE = 10;

export default function AdminPurchaseOrdersPage() {
    const db = useFirestore();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageHistory, setPageHistory] = useState<(DocumentSnapshot<DocumentData> | null)[]>([null]);
    
    const { data: purchaseOrders, loading, lastDoc } = useCollection<PurchaseOrder>(db, "purchaseOrders", {
        orderBy: ["createdAt", "desc"],
        limit: PAGE_SIZE,
        startAfter: pageHistory[currentPage - 1]
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
  
    const canGoNext = purchaseOrders && purchaseOrders.length === PAGE_SIZE;

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
          {!loading && purchaseOrders && (
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
                  {purchaseOrders.length > 0 ? purchaseOrders.map(po => (
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
  )
}
