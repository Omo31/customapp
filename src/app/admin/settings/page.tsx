
'use client';

import { StoreSettingsManager } from '@/components/admin/store-settings-manager';
import { UnitSettingsManager } from '@/components/admin/unit-settings-manager';
import { ServiceSettingsManager } from '@/components/admin/service-settings-manager';
import { ShippingSettingsManager } from '@/components/admin/shipping-settings-manager';
import { SupplierSettingsManager } from '@/components/admin/supplier-settings-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure various aspects of your store and custom order forms.
        </p>
      </div>

      <Tabs defaultValue="store-items">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="store-items">Store Products</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="units">Units of Measure</TabsTrigger>
          <TabsTrigger value="services">Optional Services</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Zones</TabsTrigger>
        </TabsList>
        <TabsContent value="store-items">
          <StoreSettingsManager />
        </TabsContent>
         <TabsContent value="suppliers">
          <SupplierSettingsManager />
        </TabsContent>
        <TabsContent value="units">
          <UnitSettingsManager />
        </TabsContent>
        <TabsContent value="services">
          <ServiceSettingsManager />
        </TabsContent>
        <TabsContent value="shipping">
          <ShippingSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
