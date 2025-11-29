
import { PurchaseOrderForm } from "@/components/admin/purchase-order-form";

export default function NewPurchaseOrderPage() {
    return (
         <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium font-headline">New Purchase Order</h3>
                <p className="text-sm text-muted-foreground">Fill out the form below to create a new purchase order.</p>
            </div>
            <PurchaseOrderForm />
        </div>
    )
}
