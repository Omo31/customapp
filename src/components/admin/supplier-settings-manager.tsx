
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
import { Textarea } from '../ui/textarea';

const supplierSchema = z.object({
  id: z.string().min(1, 'ID is required.'),
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
});

const formSchema = z.object({
  suppliers: z.array(supplierSchema),
});

export function SupplierSettingsManager() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: settings, loading } = useDoc<CustomOrderSettings>(db, 'settings', 'customOrder');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      suppliers: [],
    },
  });
  
  React.useEffect(() => {
    if (settings && settings.suppliers) {
        form.reset({ suppliers: settings.suppliers });
    }
  }, [settings, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'suppliers',
  });
  
  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const settingsRef = doc(db, 'settings', 'customOrder');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Suppliers Saved',
        description: 'Your list of suppliers has been updated.',
      });
      form.reset(values);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Suppliers',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }
  
  const generateId = (name: string) => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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
                  <Skeleton className="h-10 w-32" />
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
            <CardTitle>Supplier Management</CardTitle>
            <CardDescription>
              Add, edit, or remove suppliers for your purchase orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4 relative bg-secondary/30">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name={`suppliers.${index}.name`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Supplier Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 'Global Food Imports'" {...field} 
                                onBlur={(e) => {
                                    field.onBlur();
                                    const currentId = form.getValues(`suppliers.${index}.id`);
                                    if (!currentId) {
                                        form.setValue(`suppliers.${index}.id`, generateId(e.target.value));
                                    }
                                }}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`suppliers.${index}.id`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Supplier ID</FormLabel>
                            <FormControl>
                            <Input placeholder="auto-generated-id" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`suppliers.${index}.email`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="contact@supplier.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`suppliers.${index}.phone`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name={`suppliers.${index}.address`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                <Textarea placeholder="123 Supplier Lane..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove Supplier</span>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
             <Button
              type="button"
              variant="outline"
              onClick={() => append({ id: '', name: '', email: '', phone: '', address: '' })}
            >
              Add New Supplier
            </Button>
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Suppliers'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
