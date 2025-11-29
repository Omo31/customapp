import ProtectedRoute from '@/components/auth/protected-route';
import { AdvancedCustomOrderForm } from '@/components/home/advanced-custom-order-form';

export default function CustomOrderPage() {
  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
            <div className="space-y-2 mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">Create a Custom Quote</h1>
                <p className="text-muted-foreground">
                    Looking for specific items or services? Fill out the form below, and we’ll get back to you with a detailed quote.
                </p>
            </div>
            <AdvancedCustomOrderForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
