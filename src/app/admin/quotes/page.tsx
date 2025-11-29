"use client"

import { useFirestore, useCollection } from "@/firebase";
import { Quote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminQuotesPage() {
    const db = useFirestore();
    const { data: quotes, loading } = useCollection<Quote>(db, "quotes", {
        orderBy: ["createdAt", "desc"]
    });

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
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
          )}
          {!loading && quotes && (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length > 0 ? quotes.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.customerName}</TableCell>
                      <TableCell>{new Date(quote.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell><Badge>{quote.status}</Badge></TableCell>
                      <TableCell className="text-right">{quote.items.length}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No quotes to display.</TableCell>
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
