
'use client';

import { ExpenseCategoryManager } from '@/components/admin/expense-category-manager';

export default function AccountingSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Accounting Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure settings related to accounting and expense tracking.
        </p>
      </div>
      <ExpenseCategoryManager />
    </div>
  );
}
