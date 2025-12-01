
'use client';

import { useFirestore, useCollection } from "@/firebase";
import { type Order, type PurchaseOrder, type Expense } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "../ui/pagination";

type Transaction = {
  id: string;
  type: 'Income' | 'Expense';
  description: string;
  date: Date;
  amount: number;
  sourceType: 'Order' | 'Purchase Order' | 'Manual Expense';
  sourceId: string;
};

const PAGE_SIZE = 15;

export function TransactionsLedger() {
  const db = useFirestore();

  const { data: deliveredOrders, loading: ordersLoading } = useCollection<Order>(db, "orders", { where: ["status", "==", "Delivered"] });
  const { data: completedPOs, loading: poLoading } = useCollection<PurchaseOrder>(db, "purchaseOrders", { where: ["status", "==", "Completed"] });
  const { data: manualExpenses, loading: expensesLoading } = useCollection<Expense>(db, "expenses");

  const [currentPage, setCurrentPage] = useState(1);

  const allTransactions = useMemo(() => {
    const transactions: Transaction[] = [];

    deliveredOrders?.forEach(order => {
      transactions.push({
        id: `order-${order.id}`,
        type: 'Income',
        description: `Sale from Order #${order.id?.slice(-6)}`,
        date: new Date(order.createdAt.seconds * 1000),
        amount: order.totalCost,
        sourceType: 'Order',
        sourceId: order.id || '',
      });
    });

    completedPOs?.forEach(po => {
      transactions.push({
        id: `po-${po.id}`,
        type: 'Expense',
        description: `Payment for PO #${po.poNumber}`,
        date: new Date(po.deliveryDate.seconds * 1000),
        amount: po.total,
        sourceType: 'Purchase Order',
        sourceId: po.id || '',
      });
    });

    manualExpenses?.forEach(expense => {
      transactions.push({
        id: `expense-${expense.id}`,
        type: 'Expense',
        description: expense.description,
        date: new Date(expense.date.seconds * 1000),
        amount: expense.amount,
        sourceType: 'Manual Expense',
        sourceId: expense.id || '',
      });
    });

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [deliveredOrders, completedPOs, manualExpenses]);

  const loading = ordersLoading || poLoading || expensesLoading;

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return allTransactions.slice(startIndex, endIndex);
  }, [allTransactions, currentPage]);

  const canGoNext = currentPage * PAGE_SIZE < allTransactions.length;
  const canGoPrevious = currentPage > 1;

  const handleNextPage = () => {
    if (canGoNext) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (canGoPrevious) setCurrentPage(currentPage - 1);
  };
  
  const currentBalance = useMemo(() => {
      const income = allTransactions
        .filter(t => t.type === 'Income')
        .reduce((acc, t) => acc + t.amount, 0);
      const expense = allTransactions
        .filter(t => t.type === 'Expense')
        .reduce((acc, t) => acc + t.amount, 0);
      return income - expense;
  }, [allTransactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions Ledger</CardTitle>
        <div className="flex justify-between items-end">
            <CardDescription>A real-time log of all income and expenses.</CardDescription>
             <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₦{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {!loading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? paginatedTransactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.date.toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell>
                    <Badge variant={t.type === 'Income' ? 'default' : 'destructive'} className="bg-opacity-20 text-opacity-100">
                      {t.type === 'Income' ? (
                        <ArrowUpRight className="mr-1 h-3 w-3 text-green-700" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3 text-red-700" />
                      )}
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant="secondary">{t.sourceType}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'Income' ? '+' : '-'} ₦{t.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center">No transactions recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {allTransactions.length > PAGE_SIZE && (
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
  )
}
