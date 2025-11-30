
"use client"

import { useFirestore, useDoc } from "@/firebase";
import { type PurchaseOrder } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { Loader2 } from "lucide-react";


interface AdminPurchaseOrderDetailsPageProps {
  params: {
    poId: string;
  }
}

const poStatuses: PurchaseOrder['status'][] = ['Draft', 'Issued', 'Completed', 'Cancelled'];

export default function AdminPurchaseOrderDetailsPage({ params }: AdminPurchaseOrderDetailsPageProps) {
    const { poId } = params;
    const db = useFirestore();
    const { toast } = useToast();

    const { data: po, loading: poLoading } = useDoc<PurchaseOrder>(db, "purchaseOrders", poId);
    
    const [selectedStatus, setSelectedStatus] = useState<PurchaseOrder['status'] | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStatusUpdate = async () => {
        if (!selectedStatus || !po || selectedStatus === po.status) {
            return;
        }

        setIsSubmitting(true);
        try {
            const poRef = doc(db, "purchaseOrders", poId);
            await updateDoc(poRef, { status: selectedStatus });

             toast({
                title: "PO Status Updated",
                description: `Purchase Order is now marked as '${selectedStatus}'.`,
            });
            setSelectedStatus(undefined); // Reset selection
        } catch (error) {
             console.error("Error updating PO status:", error);
             toast({
                title: "Update Failed",
                description: "Could not update the PO status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    if (poLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    if (!po) {
        return <p>Purchase Order not found.</p>
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-headline">Purchase Order #{po.poNumber}</CardTitle>
                        <CardDescription>Issued: {po.issueDate?.seconds ? new Date(po.issueDate.seconds * 1000).toLocaleDateString() : 'N/A'}</CardDescription>
                    </div>
                    <Badge variant={po.status === 'Completed' ? 'default' : 'secondary'}>{po.status}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Supplier Details</h3>
                            <p className="font-medium">{po.supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{po.supplier.email}</p>
                            <p className="text-sm text-muted-foreground">{po.supplier.phone}</p>
                            <p className="text-sm text-muted-foreground">{po.supplier.address}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Dates</h3>
                            <p className="text-sm"><span className="font-medium">Date Issued:</span> {po.issueDate?.seconds ? new Date(po.issueDate.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm"><span className="font-medium">Expected Delivery:</span> {po.deliveryDate?.seconds ? new Date(po.deliveryDate.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                     {po.notes && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-sm text-muted-foreground italic">"{po.notes}"</p>
                        </div>
                    )}
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
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {po.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">₦{item.unitCost?.toLocaleString() || 'N/A'}</TableCell>
                                <TableCell className="text-right">₦{item.total.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Cost Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₦{po.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>₦{po.shipping.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₦{po.total.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage PO Status</CardTitle>
                        <CardDescription>Update the purchase order status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Select onValueChange={(value) => setSelectedStatus(value as PurchaseOrder['status'])} disabled={isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {poStatuses.map(status => (
                                        <SelectItem key={status} value={status} disabled={status === po.status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Button onClick={handleStatusUpdate} disabled={isSubmitting || !selectedStatus || selectedStatus === po.status}>
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

    