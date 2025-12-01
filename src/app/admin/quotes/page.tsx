
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { Quote } from "@/types";
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

export default function AdminQuotesPage() {
    const db = useFirestore();
    
    const { data: initialData, loading: initialLoading } = useCollection<Quote>(db, "quotes", {
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

    const { data: quotes, loading: paginatedLoading } = useCollection<Quote>(db, "quotes", {
        orderBy: ["createdAt", "desc"],
        limit: PAGE_SIZE,
        startAfter: startAfter
    });

    const loading = initialLoading || paginatedLoading;
    const currentQuotes = currentPage > 1 ? quotes : initialData;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Quotes</h3>
        <p className="text-sm text-muted-foreground">Review and price custom order requests from customers.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
          <CardDescription>A live list of all quote requests.</CardDescription>
        </CardHeader>
        <CardContent>
           {loading && (
             <div className="space-y-2">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
          )}
          {!loading && currentQuotes && (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentQuotes.length > 0 ? currentQuotes.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.customerName}</TableCell>
                      <TableCell>{new Date(quote.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell><Badge>{quote.status}</Badge></TableCell>
                      <TableCell>{quote.items.length}</TableCell>
                      <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/quotes/${quote.id}`}>
                                  <Eye className="mr-0 h-4 w-4 md:mr-2" />
                                  <span className="hidden md:inline">Review</span>
                              </Link>
                          </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No quotes to display.</TableCell>
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
