
'use client';

import { useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { type StoreSettings } from '@/types';

export default function ProductsPage() {
  const db = useFirestore();
  const { data: storeSettings, loading } = useDoc<StoreSettings>(db, 'settings', 'store');

  return (
    <div className="container py-8">
      <div className="space-y-2 mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
          Our Products
        </h1>
        <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
          Explore our collection of authentic Nigerian foods and ingredients.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && storeSettings && storeSettings.items && storeSettings.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storeSettings.items.map((item, index) => (
            <Card key={index} className="overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 ease-in-out"
                    data-ai-hint="product image"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-headline mb-2">{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && (!storeSettings || !storeSettings.items || storeSettings.items.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products have been added yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
