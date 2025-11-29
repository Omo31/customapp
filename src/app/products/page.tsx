import { ProductCard } from '@/components/products/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product } from '@/types';

const mockProducts: Product[] = PlaceHolderImages
  .filter(p => p.id.startsWith('product-item'))
  .map((p, i) => ({
    id: p.id,
    name: p.description,
    description: `This is a high-quality ${p.description.toLowerCase()}.`,
    price: parseFloat((Math.random() * (20 - 5) + 5).toFixed(2)),
    imageUrl: p.imageUrl,
    imageHint: p.imageHint,
  }));

export default function ProductsPage() {
  const products = mockProducts;

  return (
    <div className="container py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold font-headline">Our Products</h1>
        <p className="text-muted-foreground">
          Browse our collection of authentic Nigerian foodstuffs.
        </p>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Our store is currently empty</h2>
          <p className="text-muted-foreground mt-2">
            Please check back later for our selection of Nigerian foods.
          </p>
        </div>
      )}
    </div>
  );
}
