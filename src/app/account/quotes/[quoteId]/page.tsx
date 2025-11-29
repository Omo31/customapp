
"use client"

import { useFirestore, useDoc } from "@/firebase";
import { type Quote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePaystackPayment } from "react-paystack";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp, writeBatch } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";


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

    const { data: quote, loading: quoteLoading } = useDoc<Quote>(db, "quotes", quoteId);

    const totalItemsCost = quote?.items.reduce((acc, item) => acc + (item.unitCost || 0) * Number(item.quantity), 0) || 0;
    const shippingCost = quote?.shippingCost || 0;
    const totalCost = totalItemsCost + shippingCost;

    const paystackConfig = {
        reference: new Date().getTime().toString(),
        email: user?.email || '',
        amount: totalCost * 100, // Amount in kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    };

    const initializePayment = usePaystackPayment(paystackConfig);

    const handlePaymentSuccess = async (response: any) => {
        // IMPORTANT: In a production app, you would send the reference to your backend
        // to securely verify the transaction with Paystack's API using your secret key.
        // For this prototype, we'll optimistically assume the payment was successful.
        console.log("Paystack response:", response);

        if (!quote || !user) return;

        try {
            const batch = writeBatch(db);

            // 1. Update the quote status
            const quoteRef = doc(db, "quotes", quoteId);
            batch.update(quoteRef, { status: "Paid" });

            // 2. Create a new order
            const orderRef = doc(collection(db, "orders"));
            batch.set(orderRef, {
                userId: user.uid,
                quoteId: quoteId,
                customerName: quote.customerName,
                customerEmail: quote.customerEmail,
                items: quote.items,
                totalCost: totalCost,
                shippingAddress: quote.shippingAddress,
                status: 'Pending',
                createdAt: serverTimestamp(),
            });

            // 3. Create notifications
            const userNotifRef = doc(collection(db, `users/${user.uid}/notifications`));
            batch.set(userNotifRef, {
                userId: user.uid,
                title: "Order Placed Successfully!",
                description: `Your order #${orderRef.id.slice(-6)} has been received and is now pending.`,
                href: `/account/orders/${orderRef.id}`,
                isRead: false,
                createdAt: serverTimestamp(),
            });
            
            // This is a simplified admin notification. A real app might have a more robust system.
            const adminNotifRef = doc(collection(db, `notifications`));
            batch.set(adminNotifRef, {
                 userId: 'admin', // Generic admin user for collection group query
                 title: "New Order Received",
                 description: `A new order #${orderRef.id.slice(-6)} was placed by ${quote.customerName}.`,
                 href: `/admin/orders/${orderRef.id}`,
                 isRead: false,
                 createdAt: serverTimestamp()
            });


            await batch.commit();

            toast({
                title: "Payment Successful!",
                description: "Your order has been placed. You can view it in your order history.",
            });

            router.push(`/account/orders`);

        } catch (error) {
            console.error("Failed to update database after payment:", error);
            toast({
                title: "Database Error",
                description: "Payment was successful, but we couldn't update your order. Please contact support.",
                variant: "destructive",
            });
        }
    };

    const onPaymentClose = () => {
        toast({
            title: "Payment Modal Closed",
            description: "You can complete your payment at any time.",
            variant: "default",
        })
    }

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

    return (
        <div className="space-y-6">
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
                        <span>₦{totalItemsCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping Cost</span>
                        <span>₦{shippingCost.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <span>₦{totalCost.toLocaleString()}</span>
                    </div>
                </CardContent>
                {canPay && (
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={() => initializePayment({onSuccess: handlePaymentSuccess, onClose: onPaymentClose})}>
                            Pay with Paystack
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
