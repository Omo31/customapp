
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
import { type CustomOrderSettings } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { clearCache } from '@/app/admin/settings/actions';
import { useTransition } from 'react';

const serviceSchema = z.object({
  id: z.string().min(1, 'ID is required.'),
  label: z.string().min(1, 'Label is required.'),
});

const formSchema = z.object({
  optionalServices: z.array(serviceSchema),
});

export function ServiceSettingsManager() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: settings, loading } = useDoc<CustomOrderSettings>(db, 'settings', 'customOrder');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      optionalServices: [],
    },
  });
  
  React.useEffect(() => {
    if (settings) {
        form.reset({ optionalServices: settings.optionalServices || [] });
    }
  }, [settings, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'optionalServices',
  });
  
  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const settingsRef = doc(db, 'settings', 'customOrder');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Services Saved',
        description: 'Your list of optional services has been updated.',
      });
      form.reset(values);

      startTransition(async () => {
        await clearCache();
        toast({
            title: "Live Site Updated",
            description: "The changes are now live for all visitors.",
        });
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Services',
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
              <CardContent>
                  <Skeleton className="h-24 w-full" />
              </CardContent>
               <CardFooter className="flex-col items-start gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-full" />
              </CardFooter>
          </Card>
      )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Optional Services</CardTitle>
            <CardDescription>
              Manage the services customers can add to a custom order (e.g., Gift Wrapping, Birthday Party).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4 relative bg-secondary/30">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name={`optionalServices.${index}.label`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service Label</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 'Birthday Party'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`optionalServices.${index}.id`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service ID</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 'birthday-party'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove Service</span>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
             <Button
              type="button"
              variant="outline"
              onClick={() => append({ id: '', label: '' })}
            >
              Add New Service
            </Button>
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !isDirty || isPending}>
              {(isSubmitting || isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Services'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
