
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { type StoreSettings } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';

const storeItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  description: z.string().min(1, 'Description is required.'),
  imageUrl: z.string().url('Must be a valid URL.'),
});

const storeSettingsSchema = z.object({
  items: z.array(storeItemSchema),
});

export function StoreSettingsManager() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: storeSettings, loading: loadingSettings } = useDoc<StoreSettings>(
    db,
    'settings',
    'store'
  );

  const form = useForm<z.infer<typeof storeSettingsSchema>>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      items: [],
    },
  });
  
  React.useEffect(() => {
    if (storeSettings) {
        form.reset({ items: storeSettings.items || [] });
    }
  }, [storeSettings, form]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof storeSettingsSchema>) {
    try {
      const settingsRef = doc(db, 'settings', 'store');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Store Settings Saved',
        description: 'Your product list has been updated successfully.',
      });
      form.reset(values); // Resets the dirty state
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Settings',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  if (loadingSettings) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-10 w-32" />
              </CardContent>
               <CardFooter>
                  <Skeleton className="h-10 w-full" />
              </CardFooter>
          </Card>
      )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Manage Store Products</CardTitle>
            <CardDescription>
              Add, edit, or remove the products displayed on your store page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                       <Image 
                        src={form.watch(`items.${index}.imageUrl`) || 'https://placehold.co/100x100/e2e8f0/e2e8f0'} 
                        alt={form.watch(`items.${index}.name`) || "Placeholder"}
                        fill
                        style={{ objectFit: "cover" }}
                       />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., 'Smoked Catfish'" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.imageUrl`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                        <Textarea placeholder="A short description of the product." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Item</span>
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', description: '', imageUrl: '' })}
            >
              Add New Product
            </Button>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Store Settings'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
