
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionsLedger } from '@/components/admin/transactions-ledger';
import { ExpensesManager } from '@/components/admin/expenses-manager';
import ProtectedRoute from '@/components/auth/protected-route';

function AdminAccountingContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Accounting</h3>
        <p className="text-sm text-muted-foreground">
          View your transaction ledger and manage business expenses.
        </p>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions Ledger</TabsTrigger>
          <TabsTrigger value="expenses">Manage Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <TransactionsLedger />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpensesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}


export default function AdminAccountingPage() {
  return (
    <ProtectedRoute requiredRole="accounting">
      <AdminAccountingContent />
    </ProtectedRoute>
  );
}
