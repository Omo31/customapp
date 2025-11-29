import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Bot, Image as ImageIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomOrderForm } from '@/components/home/custom-order-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const features = [
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: 'AI Image Generation',
    description: 'Bring your ideas to life. Describe any scene, character, or concept, and watch our AI generate stunning, unique images in seconds.',
    image: PlaceHolderImages.find(p => p.id === 'feature-generate'),
    dataAiHint: 'digital art'
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: 'Intelligent Prompt Enhancement',
    description: 'Not sure how to describe your vision? Our prompt enhancement tool helps you refine and detail your ideas for higher-quality results.',
    image: PlaceHolderImages.find(p => p.id === 'feature-enhance'),
    dataAiHint: 'futuristic technology'
  },
  {
    icon: <ImageIcon className="w-8 h-8 text-primary" />,
    title: 'Personal Gallery',
    description: 'Keep track of all your creations. Your personal gallery automatically saves every image you generate for easy access and downloading.',
    image: PlaceHolderImages.find(p => p.id === 'feature-gallery'),
    dataAiHint: 'photo wall'
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
                    Unleash Your Imagination with VisionVerseAI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Turn text into breathtaking images. Our advanced AI-powered platform helps you create unique visuals, enhance your prompts, and manage your creations effortlessly.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/generate">
                      Start Creating
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
                  alt={heroImage?.description || "Abstract background"}
                  data-ai-hint={heroImage?.imageHint || 'abstract vibrant'}
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
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Craft Worlds with Words</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  VisionVerseAI provides a powerful suite of tools designed for creators, artists, and innovators. Explore what you can do.
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

        <section id="custom-order" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="generate" className="w-full">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <TabsList>
                  <TabsTrigger value="generate">Generate</TabsTrigger>
                  <TabsTrigger value="custom-order">Custom Order</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="generate">
                <div className="flex flex-col items-center justify-center space-y-4 text-center pt-8">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Generate Your Own Images</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Use our powerful AI to generate images from your own text prompts.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/generate">
                            Start Creating
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
              </TabsContent>
              <TabsContent value="custom-order">
                <div className="flex flex-col items-center justify-center space-y-4 text-center pt-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Get a Custom Quote</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Have a specific vision that requires a special touch? Fill out the form below, and we’ll provide a quote for your custom image generation.
                    </p>
                  </div>
                </div>
                 <div className="mx-auto max-w-2xl mt-8">
                    <CustomOrderForm />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">What Our Users Say</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from creative professionals who are using VisionVerseAI to push the boundaries of their work.
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
                                <p className="text-sm text-muted-foreground">Digital Artist</p>
                            </div>
                        </div>
                        <blockquote className="mt-4 text-lg font-semibold leading-snug">
                            “VisionVerseAI has completely transformed my workflow. The quality of the generated images is unparalleled.”
                        </blockquote>
                    </CardContent>
                </Card>
            </div>
             <div className="mt-8 text-center">
                <Button asChild size="lg">
                    <Link href="/signup">
                        Join VisionVerseAI Today
                        <Sparkles className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
