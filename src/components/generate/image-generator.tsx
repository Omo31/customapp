'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { enhanceImagePrompt } from '@/ai/flows/enhance-image-generation-prompt';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Sparkles, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const handleEnhancePrompt = async () => {
    if (!prompt) {
      toast({ title: 'Prompt is empty', description: 'Please enter a prompt to enhance.', variant: 'destructive' });
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceImagePrompt({ prompt });
      setPrompt(result.enhancedPrompt);
      toast({ title: 'Prompt Enhanced', description: 'Your prompt has been enhanced with more detail.' });
    } catch (error) {
      toast({
        title: 'Enhancement Failed',
        description: 'Could not enhance the prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) {
      toast({ title: 'Prompt is empty', description: 'Please enter a prompt to generate an image.', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const result = await generateImageFromPrompt({ prompt });
      setGeneratedImage(result.imageUrl);
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Could not generate the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `vision-verse-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand2 className="w-6 h-6" />
            Create Your Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Your Prompt
            </label>
            <Textarea
              id="prompt"
              placeholder="e.g., A majestic lion wearing a crown, photorealistic, 4k"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleEnhancePrompt} disabled={isEnhancing || isGenerating} className="w-full sm:w-auto">
            {isEnhancing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Enhance Prompt
          </Button>
          <Button onClick={handleGenerateImage} disabled={isGenerating || isEnhancing} className="w-full sm:w-auto">
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Image
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generated Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-full w-full" />
              </div>
            ) : generatedImage ? (
              <Image
                src={generatedImage}
                alt={prompt}
                width={512}
                height={512}
                className="object-contain"
              />
            ) : (
              <div className="text-muted-foreground text-center p-4">
                Your generated image will appear here.
              </div>
            )}
          </div>
        </CardContent>
        {generatedImage && !isGenerating && (
          <CardFooter>
            <Button onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
