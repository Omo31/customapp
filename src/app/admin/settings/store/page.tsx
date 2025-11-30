
'use client';

import { StoreSettingsManager } from '@/components/admin/store-settings-manager';
import { SupplierSettingsManager } from '@/components/admin/supplier-settings-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StoreSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Store & Suppliers</h3>
        <p className="text-sm text-muted-foreground">
          Manage products for the store showcase and the list of available suppliers.
        </p>
      </div>

      <Tabs defaultValue="store-items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="store-items">Store Products</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="store-items">
          <StoreSettingsManager />
        </TabsContent>
        <TabsContent value="suppliers">
          <SupplierSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
