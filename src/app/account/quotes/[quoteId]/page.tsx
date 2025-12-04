

"use client"

import { useFirestore, useDoc } from "@/firebase";
import { type Quote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface QuoteDetailsPageProps {
  params: {
    quoteId: string;
  }
}

export default function QuoteDetailsPage({ params }: QuoteDetailsPageProps) {
    const { quoteId } = params;
    const db = useFirestore();
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [showRetryDialog, setShowRetryDialog] = useState(false);

    const { data: quote, loading: quoteLoading } = useDoc<Quote>(db, "quotes", quoteId);

    const itemsTotal = quote?.items.reduce((acc, item) => acc + (item.unitCost || 0) * Number(item.quantity), 0) || 0;
    const serviceCharge = itemsTotal * 0.06;
    const servicesTotal = quote?.pricedServices ? Object.values(quote.pricedServices).reduce((acc, cost) => acc + cost, 0) : 0;
    const shippingCost = quote?.shippingCost || 0;
    const totalCost = itemsTotal + servicesTotal + serviceCharge + shippingCost;


    const handlePaymentSuccess = (response: any) => {
        // The webhook will now handle database updates.
        // We just need to show a confirmation message and redirect to the order page.
        toast({
            title: "Payment Successful!",
            description: "Your order is being created. You will be notified once it's confirmed.",
        });
        
        closePaymentModal(); 
        
        // The webhook will create an Order document. We can try to guess the ID,
        // but it's better to redirect the user to a page where they can see their new order appear.
        // Redirecting to the orders list is a good start.
        router.push(`/account/orders`);
    };

    const flutterwaveConfig = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
        tx_ref: quoteId, // Use the quote ID as the transaction reference
        amount: totalCost,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        // The redirect_url is a fallback for if the modal closes unexpectedly.
        // The primary success handling is in the callback.
        redirect_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/account/orders`,
        customer: {
            email: user?.email || '',
            name: user?.displayName || '',
        },
        customizations: {
            title: 'BeautifulSoup&Foods',
            description: `Payment for Quote #${quoteId.slice(-6)}`,
            logo: 'https://www.beautifulsoupandfoods.com/logo.png', // Replace with your logo URL
        },
    };

    const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);

    const initiatePayment = () => {
        handleFlutterwavePayment({
            callback: (response) => {
               handlePaymentSuccess(response);
            },
            onClose: () => {
                // This is called when the modal is closed by the user or on failure.
                // We'll prompt the user to retry.
                setShowRetryDialog(true);
            },
        });
    };

    if (quoteLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    if (!quote) {
        return <p>Quote not found.</p>
    }

    const canPay = quote.status === 'Quote Ready' && totalCost > 0;
    
    const serviceLabels = quote.services?.map(serviceId => {
        // This is a placeholder. In a real app, you'd fetch service labels from settings.
        // For now, we just format the ID.
        return serviceId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    });


    return (
        <div className="space-y-6">
            <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Payment Incomplete</AlertDialogTitle>
                    <AlertDialogDescription>
                        The payment process was not completed. Would you like to try again?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={initiatePayment}>Retry Payment</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-headline">Quote #...{quoteId.slice(-6)}</CardTitle>
                        <CardDescription>Date Created: {quote.createdAt?.seconds ? new Date(quote.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</CardDescription>
                    </div>
                    <Badge variant={quote.status === 'Quote Ready' ? "default" : "secondary"}>{quote.status}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Customer Details</h3>
                            <p className="text-sm text-muted-foreground">{quote.customerName}</p>
                            <p className="text-sm text-muted-foreground">{quote.customerEmail}</p>
                            <p className="text-sm text-muted-foreground">{quote.customerPhone}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Shipping Information</h3>
                            <p className="text-sm font-medium">{quote.deliveryOption === 'pickup' ? 'In-Store Pickup' : 'Delivery'}</p>
                            <p className="text-sm text-muted-foreground">{quote.shippingAddress || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quoted Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {quote.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.quantity} {item.unit === 'Custom' ? item.customUnit : item.unit}</TableCell>
                                <TableCell className="text-right">₦{item.unitCost?.toLocaleString() || 'N/A'}</TableCell>
                                <TableCell className="text-right">₦{((item.unitCost || 0) * Number(item.quantity)).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items Subtotal</span>
                        <span>₦{itemsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {servicesTotal > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Services Total</span>
                            <span>₦{servicesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Charge (6%)</span>
                        <span>₦{serviceCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping Cost</span>
                        <span>₦{shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <span>₦{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </CardContent>
                {canPay && (
                    <CardFooter>
                         <Button className="w-full" size="lg" onClick={initiatePayment}>
                            Pay with Flutterwave
                        </Button>
                    </CardFooter>
                )}
                 {!canPay && quote.status !== 'Paid' && (
                    <CardFooter>
                        <p className="text-sm text-muted-foreground text-center w-full">This quote is not yet ready for payment. The status must be 'Quote Ready' and have a total cost greater than zero.</p>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
