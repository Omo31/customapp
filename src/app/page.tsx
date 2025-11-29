import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, ShoppingCart, Package, Sprout } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const features = [
  {
    icon: <ShoppingCart className="w-8 h-8 text-primary" />,
    title: 'Authentic Nigerian Foods',
    description: 'Explore a wide variety of authentic Nigerian foodstuffs, from grains and spices to fresh produce, all sourced to bring the taste of home to you.',
    image: PlaceHolderImages.find(p => p.id === 'feature-foods'),
    dataAiHint: 'nigerian food'
  },
  {
    icon: <Sprout className="w-8 h-8 text-primary" />,
    title: 'Freshness Guaranteed',
    description: 'We prioritize quality and freshness. Our products are carefully selected and packaged to ensure they arrive at your doorstep in perfect condition.',
    image: PlaceHolderImages.find(p => p.id === 'feature-fresh'),
    dataAiHint: 'fresh vegetables'
  },
  {
    icon: <Package className="w-8 h-8 text-primary" />,
    title: 'Fast & Reliable Delivery',
    description: 'Get your favorite Nigerian foods delivered quickly and reliably. We offer convenient shipping options to meet your needs.',
    image: PlaceHolderImages.find(p => p.id === 'feature-delivery'),
    dataAiHint: 'delivery box'
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <>
      <main className="flex-1">
        <section className="relative w-full pt-12 md:pt-24 lg:pt-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Authentic Nigerian Foods, Delivered to You
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Shop for your favorite Nigerian ingredients and products. We make it easy to find the tastes of home, no matter where you are.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/products">
                      Start Shopping
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="#features">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-full rounded-xl overflow-hidden shadow-2xl">
                 <Image
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/1/600/400"}
                  alt={heroImage?.description || "Nigerian food"}
                  data-ai-hint={heroImage?.imageHint || 'nigerian food jollof'}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 ease-in-out hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Why Choose Us</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Your Connection to Nigerian Cuisine</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  BeautifulSoup&Foods is dedicated to providing high-quality, authentic Nigerian foodstuffs to our community. Explore what makes us special.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className="mt-4 relative h-48 w-full rounded-md overflow-hidden">
                      <Image
                        src={feature.image?.imageUrl || `https://picsum.photos/seed/${10+index}/400/300`}
                        alt={feature.image?.description || feature.title}
                        data-ai-hint={feature.image?.imageHint || ''}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Explore Our Products</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Browse our collection of Nigerian spices, grains, snacks, and more.
                </p>
                <Button asChild size="lg">
                    <Link href="/products">
                        Shop Now
                        <ShoppingCart className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">What Our Customers Say</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from fellow food lovers who trust BeautifulSoup&Foods for their Nigerian cooking needs.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                           <Avatar>
                                <AvatarImage src="https://picsum.photos/seed/avatar1/40/40" data-ai-hint="person face" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium leading-none">Jane Doe</p>
                                <p className="text-sm text-muted-foreground">Food Enthusiast</p>
                            </div>
                        </div>
                        <blockquote className="mt-4 text-lg font-semibold leading-snug">
                            “Finding authentic Nigerian ingredients was always a challenge until I found BeautifulSoup&Foods. The quality is amazing!”
                        </blockquote>
                    </CardContent>
                </Card>
            </div>
             <div className="mt-8 text-center">
                <Button asChild size="lg">
                    <Link href="/signup">
                        Join BeautifulSoup&Foods Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
