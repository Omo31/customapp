
'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingCart, FileText, Settings, Banknote, FileSliders } from 'lucide-react';
import Link from 'next/link';

const settingsCategories = [
    {
        title: 'Homepage & Footer',
        description: 'Manage content for your main landing page and site footer.',
        href: '/admin/settings/content',
        icon: FileText,
    },
    {
        title: 'Custom Order Form',
        description: 'Configure units, optional services, and shipping zones.',
        href: '/admin/settings/custom-orders',
        icon: Settings,
    },
    {
        title: 'Store & Suppliers',
        description: 'Manage showcase products and your list of suppliers.',
        href: '/admin/settings/store',
        icon: ShoppingCart,
    },
    {
        title: 'Accounting',
        description: 'Set up categories for logging business expenses.',
        href: '/admin/settings/accounting',
        icon: Banknote,
    },
]

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure various aspects of your store, content, and business operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category) => (
            <Link href={category.href} key={category.href} className="group">
                <Card className="h-full transition-all duration-200 group-hover:border-primary group-hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium font-headline">
                            {category.title}
                        </CardTitle>
                        <category.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {category.description}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
