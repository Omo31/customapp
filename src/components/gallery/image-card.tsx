'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { GeneratedImage } from '@/types';

interface ImageCardProps {
  image: GeneratedImage;
}

export function ImageCard({ image }: ImageCardProps) {

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `vision-verse-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="overflow-hidden group relative">
      <CardContent className="p-0">
        <div className="aspect-square relative">
          <Image
            src={image.imageUrl}
            alt={image.prompt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
            <p className="text-white text-sm line-clamp-3">{image.prompt}</p>
            <Button size="sm" onClick={handleDownload} className="self-end">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
