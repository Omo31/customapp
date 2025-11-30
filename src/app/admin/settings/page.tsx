
'use client';

import { StoreSettingsManager } from '@/components/admin/store-settings-manager';
import { UnitSettingsManager } from '@/components/admin/unit-settings-manager';
import { ServiceSettingsManager } from '@/components/admin/service-settings-manager';
import { ShippingSettingsManager } from '@/components/admin/shipping-settings-manager';
import { SupplierSettingsManager } from '@/components/admin/supplier-settings-manager';
import { HomepageSettingsManager } from '@/components/admin/homepage-settings-manager';
import { FooterSettingsManager } from '@/components/admin/footer-settings-manager';
import { ExpenseCategoryManager } from '@/components/admin/expense-category-manager';
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

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="store-items">Store Products</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="units">Units of Measure</TabsTrigger>
          <TabsTrigger value="services">Optional Services</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Zones</TabsTrigger>
          <TabsTrigger value="expense-categories">Expense Categories</TabsTrigger>
        </TabsList>
         <TabsContent value="homepage">
          <HomepageSettingsManager />
        </TabsContent>
         <TabsContent value="footer">
          <FooterSettingsManager />
        </TabsContent>
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
        <TabsContent value="expense-categories">
            <ExpenseCategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

    