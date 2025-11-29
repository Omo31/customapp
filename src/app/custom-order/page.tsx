import ProtectedRoute from '@/components/auth/protected-route';
import { CustomOrderForm } from '@/components/home/custom-order-form';

export default function CustomOrderPage() {
  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
            <div className="space-y-2 mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">Make a Special Request</h1>
                <p className="text-muted-foreground">
                    Looking for a specific item you can't find in our store? Fill out the form below, and we’ll do our best to source it for you.
                </p>
            </div>
            <CustomOrderForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
