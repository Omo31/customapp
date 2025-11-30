
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { type HomePageSettings } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as allLucideIcons from 'lucide-react';

const lucideIconNames = Object.keys(allLucideIcons).filter(key => key !== 'default' && key !== 'createLucideIcon' && key !== 'LucideIconProvider' && key !== 'icons');

const featuredProductSchema = z.object({
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")),
  description: z.string().optional(),
  price: z.string().optional(),
});

const featuredServiceSchema = z.object({
  icon: z.string().min(1, "Please select an icon."),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

const formSchema = z.object({
  introMessage: z.string().optional(),
  featuredProducts: z.array(featuredProductSchema).optional(),
  featuredServices: z.array(featuredServiceSchema).optional(),
  youtubeVideoUrl: z.string().url({ message: "Please enter a valid YouTube URL." }).or(z.literal("")).optional(),
  youtubeVideoDescription: z.string().optional(),
  aboutUs: z.string().optional(),
});

export function HomepageSettingsManager() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: settings, loading } = useDoc<HomePageSettings>(db, 'settings', 'homepage');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        introMessage: '',
        featuredProducts: [],
        featuredServices: [],
        youtubeVideoUrl: '',
        youtubeVideoDescription: '',
        aboutUs: ''
    },
  });
  
  React.useEffect(() => {
    if (settings) {
        form.reset(settings);
    }
  }, [settings, form]);

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control: form.control,
    name: 'featuredProducts',
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: 'featuredServices',
  });
  
  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const settingsRef = doc(db, 'settings', 'homepage');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Homepage Settings Saved',
        description: 'Your homepage content has been updated successfully.',
      });
      form.reset(values);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Settings',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-24 w-full" />
              </CardContent>
               <CardFooter>
                  <Skeleton className="h-10 w-40" />
              </CardFooter>
          </Card>
      )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Manage Homepage Content</CardTitle>
            <CardDescription>
              Update the content displayed on your homepage. Leave fields blank to hide them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="introMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introductory Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Welcome to our store..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
                <h3 className="text-lg font-medium mb-4">Featured Services</h3>
                <div className="space-y-4">
                {serviceFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-4 relative bg-secondary/30">
                        <div className="flex justify-between items-start">
                             <div className="flex-1 space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`featuredServices.${index}.icon`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an icon" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {lucideIconNames.map(iconName => (
                                                    <SelectItem key={iconName} value={iconName}>
                                                        {iconName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`featuredServices.${index}.title`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Title</FormLabel>
                                        <FormControl><Input placeholder="e.g., 'Catering Services'" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`featuredServices.${index}.description`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea placeholder="A short description of the service." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <div className="ml-4">
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeService(index)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove Service</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
                 <Button type="button" variant="outline" className="mt-4" onClick={() => appendService({ icon: '', title: '', description: '' })}>
                    Add Featured Service
                </Button>
            </div>


            <div>
                <h3 className="text-lg font-medium mb-4">Featured Products</h3>
                <div className="space-y-4">
                {productFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-4 relative bg-secondary/30">
                        <div className="flex justify-between items-start">
                             <div className="flex-1 space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`featuredProducts.${index}.imageUrl`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`featuredProducts.${index}.description`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea placeholder="A short description of the product." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`featuredProducts.${index}.price`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl><Input placeholder="e.g., ₦5,000 or 'Market Price'" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <div className="ml-4">
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeProduct(index)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove Product</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
                 <Button type="button" variant="outline" className="mt-4" onClick={() => appendProduct({ imageUrl: '', description: '', price: '' })}>
                    Add Featured Product
                </Button>
            </div>

             <FormField
              control={form.control}
              name="youtubeVideoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="youtubeVideoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Video Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short description for your video." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="aboutUs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Us</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell your customers about your business..." rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Homepage Settings'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
