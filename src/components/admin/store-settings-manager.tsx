
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
import { ImageUpload } from '../ui/image-upload';

const storeItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  description: z.string().min(1, 'Description is required.'),
  imageUrl: z.string().url('Must be a valid URL.').min(1, "Image is required."),
  price: z.string().optional(),
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
                  <FormField
                    control={form.control}
                    name={`items.${index}.imageUrl`}
                    render={({ field: imageField }) => (
                      <FormItem>
                          <FormLabel>Product Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              storagePath="product-images/"
                              currentImageUrl={imageField.value}
                              onUploadComplete={(url) => {
                                imageField.onChange(url);
                                form.trigger(`items.${index}.imageUrl`);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                    )}
                  />
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
                   <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                          <Input placeholder="e.g., ₦5,000 or 'Market Price'" {...field} />
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
              onClick={() => append({ name: '', description: '', imageUrl: '', price: '' })}
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
