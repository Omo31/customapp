import ProtectedRoute from '@/components/auth/protected-route';
import { CustomOrderForm } from '@/components/home/custom-order-form';

export default function CustomOrderPage() {
  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
            <div className="space-y-2 mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">Request a Custom Order</h1>
                <p className="text-muted-foreground">
                    Have a specific vision that requires a special touch? Fill out the form below, and we’ll provide a quote for your custom image generation.
                </p>
            </div>
            <CustomOrderForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
