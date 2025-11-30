
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { type FooterSettings } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  socialLinks: z.object({
    facebook: z.string().url().or(z.literal("")).optional(),
    instagram: z.string().url().or(z.literal("")).optional(),
    youtube: z.string().url().or(z.literal("")).optional(),
  }).optional(),
  privacyPolicyLink: z.string().url().or(z.literal("")).optional(),
  termsLink: z.string().url().or(z.literal("")).optional(),
  cookiesPolicyLink: z.string().url().or(z.literal("")).optional(),
  address: z.string().optional(),
  openingHours: z.string().optional(),
});

export function FooterSettingsManager() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: settings, loading } = useDoc<FooterSettings>(db, 'settings', 'footer');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socialLinks: { facebook: '', instagram: '', youtube: '' },
      address: '',
      openingHours: '',
      privacyPolicyLink: '',
      termsLink: '',
      cookiesPolicyLink: '',
    },
  });
  
  React.useEffect(() => {
    if (settings) {
        form.reset(settings);
    }
  }, [settings, form]);

  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const settingsRef = doc(db, 'settings', 'footer');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Footer Settings Saved',
        description: 'Your footer content has been updated successfully.',
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
            <CardTitle>Manage Footer Content</CardTitle>
            <CardDescription>
              Update the links, address, and other information displayed in your site's footer. Leave fields blank to hide them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Social Links */}
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">Social Media Links</h3>
                <FormField
                    control={form.control}
                    name="socialLinks.facebook"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl><Input placeholder="https://facebook.com/your-page" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl><Input placeholder="https://instagram.com/your-profile" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="socialLinks.youtube"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl><Input placeholder="https://youtube.com/your-channel" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            {/* Legal Links */}
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">Legal Page Links</h3>
                 <FormField
                    control={form.control}
                    name="privacyPolicyLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Privacy Policy URL</FormLabel>
                            <FormControl><Input placeholder="/privacy" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="termsLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Terms & Conditions URL</FormLabel>
                            <FormControl><Input placeholder="/terms" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="cookiesPolicyLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cookies Policy URL</FormLabel>
                            <FormControl><Input placeholder="/cookies" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

             {/* Contact Info */}
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">Contact Information</h3>
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl><Textarea placeholder="123 Food Street..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="openingHours"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Opening Hours</FormLabel>
                            <FormControl><Textarea placeholder="Mon - Fri: 9am - 5pm" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Footer Settings'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
