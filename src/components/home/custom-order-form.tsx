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
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Please provide a detailed description." }),
  size: z.string().optional(),
})

export function CustomOrderForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      size: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a custom order.",
        variant: "destructive",
        action: (
          <Button onClick={() => router.push("/login")}>Login</Button>
        ),
      })
      return
    }

    setIsSubmitting(true)
    console.log(values)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Quote Submitted!",
        description: "We've received your custom order request and will get back to you shortly.",
      })
      form.reset()
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Request a Custom Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Cyberpunk City at Night'" {...field} />
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
                      placeholder="Describe the scene, characters, colors, and style you envision."
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
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Size (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., '1920x1080px' or '1:1 ratio'" {...field} />
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