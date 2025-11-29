"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth.tsx"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const formSchema = z.object({
  itemName: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Please provide a detailed description of the item." }),
  quantity: z.string().optional(),
})

export function CustomOrderForm() {
  const { user } = useAuth()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      description: "",
      quantity: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a special request.",
        variant: "destructive",
        action: (
          <Button onClick={() => router.push("/login")}>Login</Button>
        ),
      })
      return
    }

    setIsSubmitting(true)

    try {
      const quotesCollection = collection(db, "quotes");
      const newQuote = {
        userId: user.uid,
        customerName: user.displayName || 'N/A',
        customerEmail: user.email || 'N/A',
        customerPhone: '', // This will be part of the advanced form
        items: [
            { name: values.itemName, quantity: values.quantity || '1', unit: 'Custom' , customUnit: values.description }
        ],
        services: [],
        additionalNotes: values.description,
        deliveryOption: 'quote',
        status: 'Pending Review',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(quotesCollection, newQuote);

      toast({
        title: "Request Submitted!",
        description: "We've received your special request and will get back to you shortly.",
      })
      form.reset()
      router.push(`/account/quotes/${docRef.id}`);

    } catch (error) {
        console.error("Error submitting quote:", error);
        const permissionError = new FirestorePermissionError({
            path: `quotes`,
            operation: 'create',
            requestResourceData: values
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            title: "Submission Failed",
            description: "Could not submit your request. Please try again.",
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Special Item Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Fresh Bitter-leaf'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the item, including any specific brand, type, or preparation you're looking for."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., '2 bunches' or '500g'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                "Submit Request"
              )}
            </Button>
            {!user && (
                 <p className="text-center text-sm text-muted-foreground">
                    You must be <a href="/login" className="underline">signed in</a> to submit a request.
                </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
