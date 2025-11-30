
'use client';

import { UnitSettingsManager } from '@/components/admin/unit-settings-manager';
import { ServiceSettingsManager } from '@/components/admin/service-settings-manager';
import { ShippingSettingsManager } from '@/components/admin/shipping-settings-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomOrderSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Custom Order Form Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure the options available on the custom quote request form.
        </p>
      </div>

      <Tabs defaultValue="units" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="units">Units of Measure</TabsTrigger>
          <TabsTrigger value="services">Optional Services</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Zones</TabsTrigger>
        </TabsList>
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
