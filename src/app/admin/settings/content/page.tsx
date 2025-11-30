
'use client';

import { HomepageSettingsManager } from '@/components/admin/homepage-settings-manager';
import { FooterSettingsManager } from '@/components/admin/footer-settings-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContentSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Content Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage the content for your homepage and site footer.
        </p>
      </div>

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
         <TabsContent value="homepage">
          <HomepageSettingsManager />
        </TabsContent>
         <TabsContent value="footer">
          <FooterSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
