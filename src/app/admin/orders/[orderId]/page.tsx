
"use client"

import { useFirestore, useDoc } from "@/firebase";
import { type Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { collection, doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { Loader2 } from "lucide-react";


interface AdminOrderDetailsPageProps {
  params: {
    orderId: string;
  }
}

const orderStatuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetailsPage({ params }: AdminOrderDetailsPageProps) {
    const { orderId } = params;
    const db = useFirestore();
    const { toast } = useToast();

    const { data: order, loading: orderLoading } = useDoc<Order>(db, "orders", orderId);
    
    const [selectedStatus, setSelectedStatus] = useState<Order['status'] | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStatusUpdate = async () => {
        if (!selectedStatus || !order || selectedStatus === order.status) {
            return;
        }

        setIsSubmitting(true);
        try {
            const batch = writeBatch(db);

            // 1. Update the order status
            const orderRef = doc(db, "orders", orderId);
            batch.update(orderRef, { status: selectedStatus });

            // 2. Create a notification for the user
            const userNotifRef = doc(collection(db, `users/${order.userId}/notifications`));
            batch.set(userNotifRef, {
                userId: order.userId,
                title: `Your order is now ${selectedStatus}`,
                description: `The status of your order #${orderId.slice(-6)} has been updated.`,
                href: `/account/orders/${orderId}`,
                isRead: false,
                createdAt: serverTimestamp(),
            });

            await batch.commit();

             toast({
                title: "Order Status Updated",
                description: `Order is now marked as '${selectedStatus}'. The user has been notified.`,
            });
            setSelectedStatus(undefined); // Reset selection
        } catch (error) {
             console.error("Error updating order status:", error);
             toast({
                title: "Update Failed",
                description: "Could not update the order status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    if (orderLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    if (!order) {
        return <p>Order not found.</p>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-headline">Order #...{orderId.slice(-6)}</CardTitle>
                        <CardDescription>Date Placed: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</CardDescription>
                    </div>
                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Customer Details</h3>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Shipping Address</h3>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ordered Items</CardTitle>
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
                        {order.items.map((item, index) => (
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Cost Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total Amount Paid</span>
                            <span>₦{order.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Order Status</CardTitle>
                        <CardDescription>Update the order status and notify the customer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Select onValueChange={(value) => setSelectedStatus(value as Order['status'])} disabled={isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {orderStatuses.map(status => (
                                        <SelectItem key={status} value={status} disabled={status === order.status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Button onClick={handleStatusUpdate} disabled={isSubmitting || !selectedStatus || selectedStatus === order.status}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
