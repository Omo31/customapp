

"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth.tsx"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { addDoc, collection, doc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useFirestore, useDoc } from "@/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Link from "next/link"
import { type CustomOrderSettings, type UserProfile } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(2, "Item name must be at least 2 characters."),
    quantity: z.string().min(1, "Quantity is required."),
    unit: z.string().min(1, "Unit is required."),
    customUnit: z.string().optional(),
  })).min(1, "Please add at least one item."),
  services: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
  deliveryOption: z.enum(["pickup", "delivery-lagos", "quote"], {
    required_error: "You must select a shipping option.",
  }),
  lagosLga: z.string().optional(),
  shippingAddress: z.string().optional(),
  customerName: z.string().min(1, "Name is required."),
  customerEmail: z.string().email("Invalid email address."),
  customerPhone: z.string().min(1, "Phone number is required."),
}).refine(data => {
    if (data.deliveryOption === "delivery-lagos") {
        return !!data.lagosLga && !!data.shippingAddress;
    }
    return true;
}, {
    message: "LGA and full address are required for Lagos delivery.",
    path: ["shippingAddress"],
}).refine(data => {
    if (data.deliveryOption === "quote") {
        return !!data.shippingAddress;
    }
    return true;
}, {
    message: "Full address is required for a shipping quote.",
    path: ["shippingAddress"],
});


export function AdvancedCustomOrderForm() {
  const { user } = useAuth()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()

  const { data: settings, loading: settingsLoading } = useDoc<CustomOrderSettings>(db, 'settings', 'customOrder');
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(db, 'users', user?.uid);


  const unitsOfMeasure = settings?.unitsOfMeasure || [];
  const optionalServices = settings?.optionalServices || [];
  const shippingZones = settings?.shippingZones || [];


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: "", quantity: "1", unit: "", customUnit: "" }],
      services: [],
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
    },
  })

  React.useEffect(() => {
    if (userProfile) {
        form.setValue('customerName', `${userProfile.firstName} ${userProfile.lastName}`.trim());
        form.setValue('customerEmail', userProfile.email || '');
        form.setValue('customerPhone', userProfile.phoneNumber || '');
        form.setValue('shippingAddress', userProfile.shippingAddress || '');
    }
  }, [userProfile, form]);

  const { isSubmitting } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchDeliveryOption = form.watch("deliveryOption");
  const watchLagosLga = form.watch("lagosLga");
  const selectedLgaFee = shippingZones.find(lga => lga.name === watchLagosLga)?.fee || 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a quote request.",
        variant: "destructive",
      });
      return;
    }

    const batch = writeBatch(db);

    // 1. Create the new quote
    const quoteRef = doc(collection(db, "quotes"));
    const newQuoteData = {
      ...values,
      userId: user.uid,
      shippingCost: watchDeliveryOption === 'delivery-lagos' ? selectedLgaFee : 0,
      status: 'Pending Review',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(quoteRef, newQuoteData);

    // 2. Create notification for the user
    const userNotifRef = doc(collection(db, `users/${user.uid}/notifications`));
    batch.set(userNotifRef, {
        userId: user.uid,
        title: "Quote Request Received",
        description: `We've received your request #${quoteRef.id.slice(-6)} and will review it shortly.`,
        href: `/account/quotes/${quoteRef.id}`,
        isRead: false,
        createdAt: serverTimestamp(),
    });
    
    // 3. Create notification for admins with the 'quotes' role
    const adminNotifRef = doc(collection(db, `notifications`));
    batch.set(adminNotifRef, {
        role: 'quotes',
        title: "New Quote Request",
        description: `A new quote #${quoteRef.id.slice(-6)} was submitted by ${values.customerName}.`,
        href: `/admin/quotes/${quoteRef.id}`,
        isRead: false,
        createdAt: serverTimestamp(),
    });

    await batch.commit()
        .then(() => {
            toast({
                title: "Quote Request Submitted!",
                description: "We've received your request. You can track its status on your 'My Quotes' page.",
            });
            router.push(`/account/quotes`);
        })
        .catch(async (serverError) => {
            console.error("Error submitting quote:", serverError);
            const permissionError = new FirestorePermissionError({
                path: `quotes`,
                operation: 'create',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                title: "Submission Failed",
                description: "Could not submit your quote request. Please check your permissions and try again.",
                variant: "destructive"
            });
        });
  }

  if (settingsLoading || profileLoading) {
    return (
        <Card>
            <CardContent className="space-y-8 pt-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 pt-6">
            
            {/* Items Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Items for Your Quote</CardTitle>
                    <CardDescription>Add all the items you need a price for.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-background/50">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <FormField
                                    control={form.control}
                                    name={`items.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 'Fresh Ugba'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., '2'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>

                             <FormField
                                control={form.control}
                                name={`items.${index}.unit`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit of Measure</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a unit" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {unitsOfMeasure.map(unit => (
                                            <SelectItem key={unit.name} value={unit.name}>{unit.name}</SelectItem>
                                        ))}
                                         <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            {form.watch(`items.${index}.unit`) === 'Other' && (
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.customUnit`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custom Unit</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., 'a small basket'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                            
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                     <span className="sr-only">Remove Item</span>
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: "", quantity: "1", unit: "", customUnit: "" })}
                    >
                        Add Another Item
                    </Button>
                </CardContent>
            </Card>

            {/* Optional Services & Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Optional Services & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="services"
                        render={() => (
                            <FormItem>
                                <FormLabel>Select any additional services you require.</FormLabel>
                                <div className="space-y-2">
                                    {optionalServices.map((service) => (
                                        <FormField
                                        key={service.id}
                                        control={form.control}
                                        name="services"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={service.id}
                                                className="flex flex-row items-center space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(service.id)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), service.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== service.id
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {service.label}
                                                </FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Separator />
                    <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preferences or Instructions (Optional)</FormLabel>
                         <FormDescription>Describe how you want services rendered or any other specific details.</FormDescription>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., 'Please gift wrap the snail separately.' or 'I need the birthday party service for 20 people.'"
                            rows={4}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>

            {/* Delivery Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Delivery & Pickup</CardTitle>
                    <CardDescription>How would you like to receive your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="deliveryOption"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2"
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                        <RadioGroupItem value="pickup" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        In-Store Pickup
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                        <RadioGroupItem value="delivery-lagos" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Delivery within Lagos
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                        <RadioGroupItem value="quote" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Request Shipping Quote
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {watchDeliveryOption === 'delivery-lagos' && (
                        <div className="space-y-4 p-4 border rounded-md bg-background/50">
                            <FormField
                                control={form.control}
                                name="lagosLga"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select LGA</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select your Local Government Area" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {shippingZones.map(lga => (
                                        <SelectItem key={lga.name} value={lga.name}>{lga.name} (₦{lga.fee.toLocaleString()})</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shippingAddress"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Shipping Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Your detailed address, including building number and street." {...field} autoComplete="street-address" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {watchDeliveryOption === 'quote' && (
                         <div className="space-y-4 p-4 border rounded-md bg-background/50">
                            <FormField
                                control={form.control}
                                name="shippingAddress"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Shipping Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter your full address for a shipping quote (City, State, etc.)" {...field} autoComplete="street-address" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Your Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input {...field} autoComplete="name" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} disabled={!!user?.email} autoComplete="email" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input type="tel" {...field} autoComplete="tel" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
             <div className="w-full p-4 rounded-lg bg-secondary text-secondary-foreground space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Items & Services</span>
                        <span>To be quoted by admin</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                         <span>
                            {watchDeliveryOption === 'pickup' && 'No charge (Pickup)'}
                            {watchDeliveryOption === 'quote' && 'To be quoted'}
                            {watchDeliveryOption === 'delivery-lagos' && (selectedLgaFee > 0 ? `₦${selectedLgaFee.toLocaleString()}` : 'Select LGA')}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                        <span>Estimated Total</span>
                        <span>To be quoted</span>
                    </div>
                </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !user} size="lg">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting for Quote...</>
              ) : (
                "Submit Request for Quote"
              )}
            </Button>
            {!user && (
              <p className="text-center text-sm text-muted-foreground">
                Please{" "}
                <Link href="/login" className="underline hover:text-primary">
                  log in
                </Link>{" "}
                or{" "}
                <Link href="/signup" className="underline hover:text-primary">
                  sign up
                </Link>{" "}
                to submit a quote.
              </p>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
