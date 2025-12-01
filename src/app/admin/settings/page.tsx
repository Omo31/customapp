
'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, ShoppingCart, FileText, Settings, Banknote, FileSliders, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { clearCache } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';

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

function CacheManagementCard() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleClearCache = () => {
        startTransition(async () => {
            await clearCache();
            toast({
                title: "Cache Cleared",
                description: "The application's data cache has been successfully cleared.",
            });
        });
    }

    return (
        <Card className="md:col-span-2 border-destructive/50">
            <CardHeader>
                <CardTitle className="text-base font-medium font-headline flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    Cache Management
                </CardTitle>
                 <CardDescription>
                    Manually clear the server-side data cache for the entire application. This will force all pages to fetch fresh data from the database. Use this after making significant content changes.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button variant="destructive" onClick={handleClearCache} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Clear Server Cache
                </Button>
            </CardFooter>
        </Card>
    )
}


function AdminSettingsContent() {
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
        <CacheManagementCard />
      </div>
    </div>
  );
}


export default function AdminSettingsPage() {
    return (
        <ProtectedRoute requiredRole="settings">
            <AdminSettingsContent />
        </ProtectedRoute>
    )
}
