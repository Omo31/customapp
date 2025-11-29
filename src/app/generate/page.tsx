import ProtectedRoute from '@/components/auth/protected-route';
import ImageGenerator from '@/components/generate/image-generator';

export default function GeneratePage() {
  return (
    <ProtectedRoute>
      <div className="container py-8">
        <ImageGenerator />
      </div>
    </ProtectedRoute>
  );
}
