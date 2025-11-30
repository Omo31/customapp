
'use client';

import { useFirestore, useDoc } from '@/firebase';
import { type HomePageSettings, type FeaturedService } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as allLucideIcons from 'lucide-react';

function YoutubeEmbed({ url }: { url: string }) {
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  if (!videoId) return <p>Invalid YouTube URL</p>;
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  return (
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full rounded-lg"
      ></iframe>
    </div>
  );
}

const ServiceIcon = ({ name, ...props }: { name: string, className?: string }) => {
    const IconComponent = (allLucideIcons as any)[name];
    if (!IconComponent) {
        return <allLucideIcons.HelpCircle {...props} />; // Fallback icon
    }
    return <IconComponent {...props} />;
};


const HomePageSkeleton = () => (
  <main className="flex-1">
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-2/3 mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-6 w-full max-w-lg mx-auto" />
        </div>
      </div>
    </section>
    <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container grid items-center justify-center gap-8 px-4 md:px-6">
        <Skeleton className="h-72 w-full max-w-4xl" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>
    </section>
    <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
       <div className="container px-4 md:px-6">
          <Skeleton className="h-40 w-full max-w-3xl mx-auto" />
       </div>
    </section>
  </main>
);

export default function Home() {
  const db = useFirestore();
  const { data: settings, loading } = useDoc<HomePageSettings>(db, 'settings', 'homepage');

  if (loading) {
    return <HomePageSkeleton />;
  }

  return (
    <main className="flex-1">
      {/* Intro Message */}
      {settings?.introMessage && (
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                {settings.introMessage.split('\n')[0]}
              </h1>
              {settings.introMessage.includes('\n') && (
                 <p className="max-w-[700px] text-muted-foreground md:text-xl whitespace-pre-line">
                    {settings.introMessage.split('\n').slice(1).join('\n')}
                 </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Services */}
      {settings?.featuredServices && settings.featuredServices.length > 0 && (
          <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
              <div className="container px-4 md:px-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {settings.featuredServices.map((service, index) => (
                          <div key={index} className="flex flex-col items-center text-center gap-4">
                              <div className="bg-primary text-primary-foreground rounded-full p-4">
                                  <ServiceIcon name={service.icon} className="h-8 w-8" />
                              </div>
                              <div className="space-y-2">
                                  <h3 className="text-xl font-bold font-headline">{service.title}</h3>
                                  <p className="text-muted-foreground">{service.description}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>
      )}

      {/* Featured Products */}
      {settings?.featuredProducts && settings.featuredProducts.length > 0 && (
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
              {settings.featuredProducts.map((product, index) => (
                <Card key={index} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-64 w-full">
                      <Image
                        src={product.imageUrl || `https://picsum.photos/seed/${10 + index}/400/300`}
                        alt={product.description || 'Featured Product'}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="p-4">
                        <p className="text-muted-foreground text-sm">{product.description}</p>
                        {product.price && <p className="font-bold text-lg mt-2">{product.price}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YouTube Video */}
      {settings?.youtubeVideoUrl && (
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <div className="max-w-4xl mx-auto">
                 <YoutubeEmbed url={settings.youtubeVideoUrl} />
              </div>
              {settings.youtubeVideoDescription && (
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {settings.youtubeVideoDescription}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* About Us */}
       {settings?.aboutUs && (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">About Us</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed whitespace-pre-line">
                  {settings.aboutUs}
                </p>
              </div>
            </div>
          </div>
        </section>
       )}
       
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
    </main>
  );
}
