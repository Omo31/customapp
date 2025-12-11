

"use client"

import * as React from "react"
import { useFirestore, useDoc } from "@/firebase";
import { type Quote, type CustomOrderSettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const quoteItemSchema = z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string(),
    customUnit: z.string().optional(),
    unitCost: z.coerce.number().min(0, "Cost must be a positive number.").default(0),
    total: z.coerce.number().optional(),
});

const formSchema = z.object({
    items: z.array(quoteItemSchema),
    serviceCosts: z.record(z.coerce.number().min(0, "Cost must be a positive number.").default(0)),
    shippingCost: z.coerce.number().min(0, "Cost must be a positive number.").default(0),
    itemsTotal: z.coerce.number().default(0),
    servicesTotal: z.coerce.number().default(0),
    serviceCharge: z.coerce.number().default(0),
    grandTotal: z.coerce.number().default(0),
});


interface AdminQuoteDetailsPageProps {
  params: {
    quoteId: string;
  }
}

export default function AdminQuoteDetailsPage({ params }: AdminQuoteDetailsPageProps) {
    const { quoteId } = params;
    const db = useFirestore();
    const { toast } = useToast();

    const { data: quote, loading: quoteLoading } = useDoc<Quote>(db, "quotes", quoteId);
    const { data: settings, loading: settingsLoading } = useDoc<CustomOrderSettings>(db, 'settings', 'customOrder');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            items: [],
            serviceCosts: {},
            shippingCost: 0,
            itemsTotal: 0,
            servicesTotal: 0,
            serviceCharge: 0,
            grandTotal: 0,
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "items",
    });

    React.useEffect(() => {
        if (quote) {
            const serviceCosts = quote.services?.reduce((acc, serviceId) => {
                acc[serviceId] = quote.pricedServices?.[serviceId] || 0;
                return acc;
            }, {} as Record<string, number>) || {};

            form.reset({
                items: quote.items.map(item => ({ ...item, unitCost: item.unitCost || 0, total: (item.unitCost || 0) * Number(item.quantity) })),
                serviceCosts: serviceCosts,
                shippingCost: quote.shippingCost || 0,
            });
        }
    }, [quote, form]);

    const watchedItems = useWatch({ control: form.control, name: "items" });
    const watchedServices = useWatch({ control: form.control, name: "serviceCosts" });
    const watchedShipping = useWatch({ control: form.control, name: "shippingCost" });

    React.useEffect(() => {
        const newItemsTotal = watchedItems.reduce((total, item) => {
             const itemTotal = (item.unitCost || 0) * Number(item.quantity);
             return total + itemTotal;
        }, 0);
        const newServicesTotal = Object.values(watchedServices).reduce((total, cost) => total + (cost || 0), 0);
        const newServiceCharge = newItemsTotal * 0.06;
        const newGrandTotal = newItemsTotal + newServicesTotal + newServiceCharge + Number(watchedShipping || 0);

        form.setValue('itemsTotal', newItemsTotal);
        form.setValue('servicesTotal', newServicesTotal);
        form.setValue('serviceCharge', newServiceCharge);
        form.setValue('grandTotal', newGrandTotal);

        watchedItems.forEach((item, index) => {
            const currentItemTotal = (item.unitCost || 0) * Number(item.quantity);
            if (form.getValues(`items.${index}.total`) !== currentItemTotal) {
                 form.setValue(`items.${index}.total`, currentItemTotal);
            }
        });

    }, [watchedItems, watchedServices, watchedShipping, form]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!quote) return;

        const batch = writeBatch(db);

        // 1. Update the quote document with prices and new status
        const quoteRef = doc(db, "quotes", quoteId);
        batch.update(quoteRef, {
            status: "Pending User Action",
            items: values.items.map(item => ({...item, total: undefined })), // Remove temporary 'total' field
            pricedServices: values.serviceCosts,
            shippingCost: values.shippingCost,
            updatedAt: serverTimestamp(),
        });

        // 2. Create a notification for the user
        const userNotifRef = doc(collection(db, `users/${quote.userId}/notifications`));
        batch.set(userNotifRef, {
            userId: quote.userId,
            title: "Your Quote is Ready for Review!",
            description: `Your quote request #${quoteId.slice(-6)} has been updated with pricing. Please accept or reject it.`,
            href: `/account/quotes/${quoteId}`,
            isRead: false,
            createdAt: serverTimestamp(),
        });

        await batch.commit()
            .then(() => {
                toast({
                    title: "Quote Sent!",
                    description: `The user has been notified that their quote is ready for review.`,
                });
            })
            .catch(async (serverError) => {
                console.error("Error sending quote:", serverError);
                const permissionError = new FirestorePermissionError({
                    path: `quotes/${quoteId}`,
                    operation: 'update',
                    requestResourceData: values
                });
                errorEmitter.emit('permission-error', permissionError);
                toast({
                    title: "Error",
                    description: "Could not send the quote. Please check your permissions and try again.",
                    variant: "destructive"
                });
            });
    }
    
    const { isSubmitting } = form.formState;
    const isLoading = quoteLoading || settingsLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        )
    }

    if (!quote) {
        return <p>Quote not found.</p>
    }
    
    const serviceLabels = quote.services?.map(serviceId => {
        return settings?.optionalServices?.find(s => s.id === serviceId)?.label || serviceId;
    });

    const getBadgeVariant = (status: Quote['status']) => {
        switch (status) {
            case 'Pending Review':
                return 'destructive';
            case 'Quote Ready':
            case 'Paid':
                return 'default';
            default:
                return 'secondary';
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl font-headline">Quote #...{quoteId.slice(-6)}</CardTitle>
                            <CardDescription>
                                For: {quote.customerName} ({quote.customerEmail})
                            </CardDescription>
                        </div>
                        <Badge variant={getBadgeVariant(quote.status)}>{quote.status}</Badge>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Delivery Information</h3>
                            <p className="text-sm font-medium">{quote.deliveryOption === 'pickup' ? 'In-Store Pickup' : 'Delivery'}</p>
                            <p className="text-sm text-muted-foreground">{quote.shippingAddress || 'N/A'}</p>
                        </div>
                         {quote.additionalNotes && (
                            <div>
                                <h3 className="font-semibold mb-2">Customer Notes</h3>
                                <p className="text-sm text-muted-foreground italic">"{quote.additionalNotes}"</p>
                            </div>
                         )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Price Requested Items</CardTitle>
                        <CardDescription>Enter the unit cost for each item the user requested.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            {fields.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 items-end gap-4 p-4 border rounded-md">
                                    <div className="md:col-span-2">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Qty: {item.quantity} {item.unit === 'Other' ? item.customUnit : item.unit}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.unitCost`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Cost (₦)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                         <FormItem>
                                            <FormLabel>Item Total (₦)</FormLabel>
                                            <FormControl>
                                                <Input type="number" readOnly value={form.getValues(`items.${index}.total`) || 0} />
                                            </FormControl>
                                         </FormItem>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {(quote.services?.length || 0) > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Price Optional Services</CardTitle>
                            <CardDescription>Enter the cost for the additional services requested.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quote.services?.map((serviceId, index) => (
                                <div key={serviceId} className="grid grid-cols-2 items-end gap-4">
                                     <p className="font-medium">{serviceLabels?.[index]}</p>
                                     <FormField
                                        control={form.control}
                                        name={`serviceCosts.${serviceId}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Service Cost (₦)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                 <Card>
                    <CardHeader>
                        <CardTitle>Shipping & Final Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quote.deliveryOption === 'quote' && (
                             <FormField
                                control={form.control}
                                name="shippingCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shipping Cost (₦)</FormLabel>
                                        <FormDescription>User selected "Request Shipping Quote". Please enter the calculated cost.</FormDescription>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Items Total</span>
                                <span>₦{form.getValues('itemsTotal').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Services Total</span>
                                <span>₦{form.getValues('servicesTotal').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Service Charge (6%)</span>
                                <span>₦{form.getValues('serviceCharge').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>₦{Number(form.getValues('shippingCost')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <Separator />
                             <div className="flex justify-between text-lg font-bold">
                                <span>Grand Total</span>
                                <span>₦{form.getValues('grandTotal').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Quote...</>
                            ) : (
                                "Send Quote to Customer"
                            )}
                         </Button>
                    </CardFooter>
                </Card>

            </form>
        </Form>
    )
}
