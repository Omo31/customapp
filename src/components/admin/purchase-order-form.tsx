

'use client';

import * as React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, CalendarIcon } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { type CustomOrderSettings, type Supplier, type PurchaseOrder } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';

const poItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  unitCost: z.coerce.number().min(0, 'Unit cost must be a positive number.'),
  total: z.coerce.number(),
});

const formSchema = z.object({
  supplierId: z.string().min(1, 'Please select a supplier.'),
  issueDate: z.date({ required_error: 'Issue date is required.' }),
  deliveryDate: z.date({ required_error: 'Expected delivery date is required.' }),
  items: z.array(poItemSchema).min(1, 'Please add at least one item.'),
  notes: z.string().optional(),
  tax: z.coerce.number().min(0).default(0),
  shipping: z.coerce.number().min(0).default(0),
});

type PurchaseOrderFormValues = z.infer<typeof formSchema>;

export function PurchaseOrderForm({ po }: { po?: PurchaseOrder }) {
  const { toast } = useToast();
  const db = useFirestore();
  const router = useRouter();
  const { data: settings, loading: settingsLoading } = useDoc<CustomOrderSettings>(db, 'settings', 'customOrder');

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitCost: 0, total: 0 }],
      tax: 0,
      shipping: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const watchedTax = useWatch({ control: form.control, name: 'tax' });
  const watchedShipping = useWatch({ control: form.control, name: 'shipping' });
  
  const subtotal = React.useMemo(() => {
    return watchedItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  }, [watchedItems]);

  const total = React.useMemo(() => {
    const taxAmount = subtotal * (watchedTax / 100);
    return subtotal + taxAmount + watchedShipping;
  }, [subtotal, watchedTax, watchedShipping]);

  React.useEffect(() => {
    watchedItems.forEach((item, index) => {
        const newTotal = item.quantity * item.unitCost;
        if (form.getValues(`items.${index}.total`) !== newTotal) {
            form.setValue(`items.${index}.total`, newTotal);
        }
    });
  }, [watchedItems, form]);

  async function onSubmit(values: PurchaseOrderFormValues) {
    if (!settings?.suppliers) return;

    const selectedSupplier = settings.suppliers.find(s => s.id === values.supplierId);
    if (!selectedSupplier) {
        toast({ title: 'Supplier not found', variant: 'destructive' });
        return;
    }

    try {
        const poCollection = collection(db, "purchaseOrders");
        const poNumber = `PO-${Date.now()}`; // Simple PO number generation

        const finalPO: Omit<PurchaseOrder, 'id'> = {
            poNumber,
            supplier: selectedSupplier,
            issueDate: values.issueDate,
            deliveryDate: values.deliveryDate,
            items: values.items,
            notes: values.notes,
            subtotal: subtotal,
            tax: values.tax,
            shipping: values.shipping,
            total: total,
            status: 'Draft',
            createdAt: serverTimestamp(),
        }

        const docRef = await addDoc(poCollection, finalPO);
        toast({ title: 'Purchase Order Created', description: `PO #${poNumber} has been saved as a draft.` });
        router.push(`/admin/purchase-orders/${docRef.id}`);

    } catch (error) {
        console.error('Error creating purchase order:', error);
        toast({ title: 'Error', description: 'Could not create the purchase order.', variant: 'destructive' });
    }
  }

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
        <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Supplier & Dates</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a supplier" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {settings?.suppliers?.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div></div>
                    <FormField
                        control={form.control}
                        name="issueDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Issue Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Expected Delivery</FormLabel>
                             <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                            <FormField
                                control={form.control}
                                name={`items.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., 50kg bag of Basmati Rice" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-3 gap-4">
                                 <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name={`items.${index}.unitCost`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Unit Cost (₦)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name={`items.${index}.total`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Total (₦)</FormLabel>
                                        <FormControl>
                                            <Input type="number" readOnly {...field} value={form.getValues(`items.${index}.quantity`) * form.getValues(`items.${index}.unitCost`)} />
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {fields.length > 1 && (
                                 <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove Item</span>
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ description: '', quantity: 1, unitCost: 0, total: 0 })}>
                        Add Item
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                     <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea placeholder="Add any notes for the supplier..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
          </div>
          
          {/* Summary Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                     <FormField
                        control={form.control}
                        name="tax"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-2 items-center gap-4">
                              <FormLabel>Tax (%)</FormLabel>
                              <FormControl>
                                  <Input type="number" id="tax" {...field} />
                              </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="shipping"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-2 items-center gap-4">
                              <FormLabel>Shipping (₦)</FormLabel>
                              <FormControl>
                                  <Input type="number" id="shipping" {...field} />
                              </FormControl>
                            </FormItem>
                        )}
                    />
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₦{total.toLocaleString()}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Draft'}
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

    
