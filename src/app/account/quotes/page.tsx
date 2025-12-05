
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Quote } from "@/types";
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

export default function QuotesPage() {
    const { user, loading: authLoading } = useAuth();
    const db = useFirestore();

    const { data: initialData, loading: initialLoading } = useCollection<Quote>(db, "quotes", {
        where: ["userId", "==", user?.uid || " "],
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
        where: ["userId", "==", user?.uid || " "],
        orderBy: ["createdAt", "desc"],
        limit: PAGE_SIZE,
        startAfter: startAfter
    });

    const loading = authLoading || (currentPage === 1 ? initialLoading : paginatedLoading);
    const currentQuotes = currentPage > 1 ? quotes : initialData;

    const getBadgeVariant = (status: Quote['status']) => {
        switch (status) {
            case 'Pending User Action':
                return 'default';
            case 'Rejected':
            case 'Cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    }


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">My Quotes</h3>
        <p className="text-sm text-muted-foreground">
          Track the status of your custom order requests.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Quotes</CardTitle>
          <CardDescription>A list of all your quote requests.</CardDescription>
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
                    <TableHead>Quote ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentQuotes.length > 0 ? currentQuotes.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">#...{quote.id?.slice(-6)}</TableCell>
                      <TableCell>{quote.createdAt?.seconds ? new Date(quote.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell><Badge variant={getBadgeVariant(quote.status)}>{quote.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/account/quotes/${quote.id}`}>
                            <Eye className="mr-0 h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">You have no quotes yet.</TableCell>
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
