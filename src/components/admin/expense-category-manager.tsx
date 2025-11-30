
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
import { type AccountingSettings } from '@/types';
import { Skeleton } from '../ui/skeleton';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
});

const formSchema = z.object({
  expenseCategories: z.array(categorySchema),
});

export function ExpenseCategoryManager() {
  const { toast } = useToast();
  const db = useFirestore();
  const { data: settings, loading } = useDoc<AccountingSettings>(db, 'settings', 'accounting');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenseCategories: [],
    },
  });
  
  React.useEffect(() => {
    if (settings) {
        form.reset({ expenseCategories: settings.expenseCategories || [] });
    }
  }, [settings, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'expenseCategories',
  });
  
  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const settingsRef = doc(db, 'settings', 'accounting');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Categories Saved',
        description: 'Your list of expense categories has been updated.',
      });
      form.reset(values);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Saving Categories',
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
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
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
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>
              Manage the categories for logging manual expenses (e.g., Rent, Utilities, Marketing).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`expenseCategories.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="e.g., 'Office Supplies'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove Category</span>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
             <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '' })}
            >
              Add New Category
            </Button>
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Categories'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    