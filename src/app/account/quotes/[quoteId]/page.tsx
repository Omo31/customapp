

"use client"

import { useFirestore, useDoc } from "@/firebase";
import { type Quote, type QuoteItem } from "@/types";
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
import { useState }from "react";
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
import { doc, updateDoc, writeBatch, collection, serverTimestamp, addDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


interface QuoteDetailsPageProps {
  params: {
    quoteId: string;
  }
}

type ActionType = 'accept' | 'reject' | 'cancel' | 'resubmit' | null;

export default function QuoteDetailsPage({ params }: QuoteDetailsPageProps) {
    const { quoteId } = params;
    const db = useFirestore();
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [showRetryDialog, setShowRetryDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionType, setActionType] = useState<ActionType>(null);


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
        
        router.push(`/account/orders`);
    };

    const flutterwaveConfig = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
        tx_ref: quoteId, // Use the quote ID as the transaction reference
        amount: totalCost,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
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
                setShowRetryDialog(true);
            },
        });
    };

    const handleQuoteAction = async (newStatus: "Quote Ready" | "Rejected" | "Cancelled") => {
        if (!user || !quote) return;
        
        setActionType(newStatus === 'Quote Ready' ? 'accept' : newStatus === 'Rejected' ? 'reject' : 'cancel');
        setIsSubmitting(true);
        const batch = writeBatch(db);

        // 1. Update the quote status
        const quoteRef = doc(db, 'quotes', quoteId);
        batch.update(quoteRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
        });

        // 2. Create notification for admins
        const adminNotifRef = doc(collection(db, 'notifications'));
        batch.set(adminNotifRef, {
            role: 'quotes',
            title: `User ${newStatus} Quote`,
            description: `${user.displayName} has ${newStatus.toLowerCase()} quote #${quoteId.slice(-6)}.`,
            href: `/admin/quotes/${quoteId}`,
            isRead: false,
            createdAt: serverTimestamp(),
        });
        
        try {
            await batch.commit();
            toast({
                title: `Quote ${newStatus}`,
                description: `You have successfully ${newStatus.toLowerCase()}ed the quote.`,
            });
        } catch (error) {
            console.error(`Error ${newStatus.toLowerCase()}ing quote:`, error);
            const permissionError = new FirestorePermissionError({
                    path: `quotes/${quoteId}`,
                    operation: 'update',
                    requestResourceData: { status: newStatus }
                });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: "Action Failed",
                description: `Could not update the quote status.`,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
            setActionType(null);
        }
    };
    
    const handleResubmitForRecosting = async () => {
        if (!user || !quote) return;
        
        setActionType('resubmit');
        setIsSubmitting(true);

        const batch = writeBatch(db);
        const newQuoteRef = doc(collection(db, "quotes"));
        
        // Create a new quote with the same data, but a new ID and reset status
        const newQuoteData: Omit<Quote, 'id'> = {
            ...quote,
            status: 'Pending Review', // Reset status for admin
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        batch.set(newQuoteRef, newQuoteData);

        // Notify admin
        const adminNotifRef = doc(collection(db, `notifications`));
        batch.set(adminNotifRef, {
            role: 'quotes',
            title: "Quote Resubmitted",
            description: `User ${quote.customerName} resubmitted a quote for re-costing.`,
            href: `/admin/quotes/${newQuoteRef.id}`,
            isRead: false,
            createdAt: serverTimestamp(),
        });

        try {
            await batch.commit();
            toast({
                title: 'Quote Resubmitted',
                description: 'Your edited quote has been sent for re-costing. You will be redirected.',
            });
            router.push(`/account/quotes/${newQuoteRef.id}`);

        } catch (error) {
             console.error(`Error resubmitting quote:`, error);
            const permissionError = new FirestorePermissionError({
                    path: `quotes`,
                    operation: 'create',
                    requestResourceData: newQuoteData
                });
            errorEmitter.emit('permission-error', permissionError);
             toast({
                title: "Action Failed",
                description: `Could not resubmit the quote.`,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
            setActionType(null);
        }
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
    
    const canPay = (quote.status === 'Quote Ready' || quote.status === 'Cancelled') && totalCost > 0;
    
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
                <CardFooter className="flex-col gap-2">
                     {quote.status === 'Pending User Action' && (
                        <div className="w-full space-y-2">
                            <p className="text-sm text-center text-muted-foreground">Please review your quote. You can accept to proceed to payment, or reject if you do not wish to continue.</p>
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <Button className="w-full" size="lg" onClick={() => handleQuoteAction('Quote Ready')} disabled={isSubmitting}>
                                    {isSubmitting && actionType === 'accept' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Accept Quote
                                </Button>
                                <Button className="w-full" size="lg" variant="destructive" onClick={() => handleQuoteAction('Rejected')} disabled={isSubmitting}>
                                     {isSubmitting && actionType === 'reject' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                     Reject Quote
                                </Button>
                            </div>
                        </div>
                    )}
                    {canPay && (
                         <div className="w-full space-y-2">
                            <Button className="w-full" size="lg" onClick={initiatePayment}>
                                Pay with Flutterwave
                            </Button>
                            {quote.status === 'Quote Ready' && (
                                <Button className="w-full" variant="outline" onClick={() => handleQuoteAction('Cancelled')} disabled={isSubmitting}>
                                    {isSubmitting && actionType === 'cancel' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Cancel
                                </Button>
                            )}
                        </div>
                    )}
                    {quote.status === 'Rejected' && (
                         <div className="w-full space-y-2 text-center">
                            <p className="text-sm text-muted-foreground">This quote was rejected. You can resubmit it for re-costing if you wish to make changes.</p>
                            <Button onClick={handleResubmitForRecosting} disabled={isSubmitting}>
                                {isSubmitting && actionType === 'resubmit' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Edit & Resubmit for Re-costing
                            </Button>
                        </div>
                    )}
                 {!canPay && !['Pending User Action', 'Rejected', 'Paid'].includes(quote.status) && (
                    <CardFooter>
                        <p className="text-sm text-muted-foreground text-center w-full">This quote is not yet ready for payment. The status must be 'Quote Ready' and have a total cost greater than zero.</p>
                    </CardFooter>
                )}
                 {quote.status === 'Paid' && (
                     <p className="text-sm text-green-600 font-medium text-center w-full">This quote has been paid. Your order has been created.</p>
                 )}
                </CardFooter>
            </Card>
        </div>
    )
}
