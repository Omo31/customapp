"use client"

import { useFirestore, useCollection } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Quote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const PAGE_SIZE = 10;

export default function QuotesPage() {
    const { user } = useAuth();
    const db = useFirestore();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageHistory, setPageHistory] = useState<(DocumentSnapshot<DocumentData> | null)[]>([null]);


    const { data: quotes, loading, lastDoc } = useCollection<Quote>(db, "quotes", {
        where: ["userId", "==", user?.uid || ""],
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
    
      const canGoNext = quotes && quotes.length === PAGE_SIZE;


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
          {!loading && quotes && (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length > 0 ? quotes.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">#...{quote.id?.slice(-6)}</TableCell>
                      <TableCell>{new Date(quote.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell><Badge>{quote.status}</Badge></TableCell>
                      <TableCell className="text-right">{quote.items.length}</TableCell>
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
