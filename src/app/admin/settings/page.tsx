
'use client';

import { StoreSettingsManager } from '@/components/admin/store-settings-manager';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure various aspects of your store's homepage, footer, and other features.
        </p>
      </div>
      <StoreSettingsManager />
    </div>
  );
}
