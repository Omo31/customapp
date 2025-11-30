
'use client';

import { useFirestore, useCollection } from "@/firebase";
import { type Expense } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExpenseForm } from "./expense-form";

const PAGE_SIZE = 10;

export function ExpensesManager() {
    const db = useFirestore();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageHistory, setPageHistory] = useState<(DocumentSnapshot<DocumentData> | null)[]>([null]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const { data: expenses, loading, lastDoc } = useCollection<Expense>(db, "expenses", {
        orderBy: ["date", "desc"],
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
  
    const canGoNext = expenses && expenses.length === PAGE_SIZE;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manual Expenses</CardTitle>
          <CardDescription>Log and track miscellaneous business expenses.</CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Log Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Log New Expense</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to add a new expense to your records.
                    </DialogDescription>
                </DialogHeader>
                <ExpenseForm onFormSubmit={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && (
           <div className="space-y-2">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
        )}
        {!loading && expenses && (
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                    <TableCell>{new Date(expense.date?.seconds * 1000).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">₦{expense.amount.toLocaleString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center">No expenses have been logged yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        )}
      </CardContent>
      {expenses && expenses.length > 0 && (
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
      )}
    </Card>
  )
}

    