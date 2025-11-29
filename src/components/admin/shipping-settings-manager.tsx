
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { type CustomOrderSettings } from '@/types';
import { Skeleton } from '../ui/skeleton';

const shippingZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required.'),
  fee: z.coerce.number().min(0, 'Fee must be a positive number.'),
});

const formSchema = z.object({
  shippingZones: z.array(shippingZoneSchema),
});

export function ShippingSettingsManager() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: settings, loading } = useDoc<CustomOrderSettings>(db, 'settings', 'customOrder');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shippingZones: [],
    },
  });
  
  React.useEffect(() => {
    if (settings) {
        form.reset({ shippingZones: settings.shippingZones || [] });
    }
  }, [settings, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'shippingZones',
  });
  
  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const settingsRef = doc(db, 'settings', 'customOrder');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Shipping Zones Saved',
        description: 'Your list of shipping zones and fees has been updated.',
      });
      form.reset(values);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Shipping Zones',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-24 w-full" />
              </CardContent>
               <CardFooter className="flex-col items-start gap-4">
                  <Skeleton className="h-10 w-40" />
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
            <CardTitle>Shipping Zones</CardTitle>
            <CardDescription>
              Manage pre-priced delivery locations for Lagos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4 relative bg-secondary/30">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name={`shippingZones.${index}.name`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Zone Name (LGA)</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 'Ikeja'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`shippingZones.${index}.fee`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Delivery Fee (₦)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 1500" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove Zone</span>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
             <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', fee: 0 })}
            >
              Add New Shipping Zone
            </Button>
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Shipping Zones'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
