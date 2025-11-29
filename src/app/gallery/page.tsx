import ProtectedRoute from '@/components/auth/protected-route';
import { ImageCard } from '@/components/gallery/image-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { GeneratedImage } from '@/types';

const mockImages: GeneratedImage[] = PlaceHolderImages
  .filter(p => p.id.startsWith('gallery-item'))
  .map((p, i) => ({
    id: p.id,
    userId: 'mock-user-id',
    prompt: p.description,
    imageUrl: p.imageUrl,
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24),
  }));

export default function GalleryPage() {
  const images = mockImages;

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline">Your Gallery</h1>
          <p className="text-muted-foreground">
            A collection of the beautiful images you have created.
          </p>
        </div>
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">Your gallery is empty</h2>
            <p className="text-muted-foreground mt-2">
              Start creating images and they will appear here.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
