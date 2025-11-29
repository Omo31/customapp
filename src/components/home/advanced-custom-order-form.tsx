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

// Mock data, to be replaced with data from admin settings
const unitsOfMeasure = ["kg", "grams", "Pieces", "Dozen", "Wraps", "Custom"]
const optionalServices = [
    { id: "gift-wrapping", label: "Gift Wrapping" },
    { id: "special-packaging", label: "Special Packaging" },
]
const lagosLgas = [
    { name: "Ikeja", fee: 1500 },
    { name: "Lagos Island", fee: 2000 },
    { name: "Lekki", fee: 2500 },
]

const formSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(2, "Item name must be at least 2 characters."),
    quantity: z.string().min(1, "Quantity is required."),
    unit: z.string().min(1, "Unit is required."),
    customUnit: z.string().optional(),
  })).min(1, "Please add at least one item."),
  services: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
  deliveryOption: z.enum(["pickup", "delivery-lagos", "quote"]),
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
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: "", quantity: "", unit: "", customUnit: "" }],
      services: [],
      deliveryOption: "pickup",
      customerName: user?.displayName || "",
      customerEmail: user?.email || "",
      customerPhone: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchDeliveryOption = form.watch("deliveryOption");
  const watchLagosLga = form.watch("lagosLga");
  const selectedLgaFee = lagosLgas.find(lga => lga.name === watchLagosLga)?.fee || 0;

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)
    // Simulate API call to create a quote
    setTimeout(() => {
      toast({
        title: "Quote Request Submitted!",
        description: "We've received your request and will get back to you shortly. You can track its status on your 'My Quotes' page.",
      })
      form.reset()
      setIsSubmitting(false)
      // Redirect to quotes page after submission
      // router.push("/account/quotes")
    }, 1500)
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">Create a Custom Order</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Fill out this form for a custom quote.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Items Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Items to Quote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
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
                                            <Input placeholder="e.g., '2'" {...field} />
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
                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            {form.watch(`items.${index}.unit`) === 'Custom' && (
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
                                    className="absolute top-2 right-2"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: "", quantity: "", unit: "", customUnit: "" })}
                    >
                        Add Another Item
                    </Button>
                </CardContent>
            </Card>

            {/* Optional Services */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Optional Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="services"
                        render={() => (
                            <FormItem className="space-y-3">
                            {optionalServices.map((service) => (
                                <FormField
                                key={service.id}
                                control={form.control}
                                name="services"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={service.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
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
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            {/* Additional Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Additional Notes</CardTitle>
                </CardHeader>
                 <CardContent>
                    <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preferences or Instructions</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Any specific brand, preparation, or other details..."
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
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="deliveryOption"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>How would you like to receive your order?</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="pickup" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        In-Store Pickup
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="delivery-lagos" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Delivery within Lagos
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="quote" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Request Shipping Quote (Outside Lagos)
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {watchDeliveryOption === 'delivery-lagos' && (
                        <div className="space-y-4 p-4 border rounded-md">
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
                                        {lagosLgas.map(lga => (
                                        <SelectItem key={lga.name} value={lga.name}>{lga.name} (₦{lga.fee})</SelectItem>
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
                                        <Textarea placeholder="Your detailed address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {watchDeliveryOption === 'quote' && (
                         <div className="space-y-4 p-4 border rounded-md">
                            <FormField
                                control={form.control}
                                name="shippingAddress"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Shipping Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter your full address for a shipping quote" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Cost Summary */}
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Items Total</span>
                        <span>To be quoted</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Services Total</span>
                        <span>To be quoted</span>
                    </div>
                     <Separator />
                     <div className="flex justify-between font-medium">
                        <span>Subtotal</span>
                        <span>To be quoted</span>
                    </div>
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
                </CardContent>
            </Card>


            {/* Customer Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Your Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
                                <Input type="email" {...field} />
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
                                <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting for Quote...</>
              ) : (
                "Submit Request for Quote"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
