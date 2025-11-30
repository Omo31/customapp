
import type { Auth } from "firebase/auth";

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  roles?: string[];
  isAdmin?: boolean; // For backwards compatibility during transition
  auth?: Auth;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
};

// Add the following types to support the custom order feature
export type QuoteItem = {
  name: string;
  quantity: string;
  unit: string;
  customUnit?: string;
  unitCost?: number;
};

export type Quote = {
  id?: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: QuoteItem[];
  services: string[];
  pricedServices?: Record<string, number>;
  additionalNotes?: string;
  deliveryOption: 'pickup' | 'delivery-lagos' | 'quote';
  lagosLga?: string;
  shippingAddress?: string;
  shippingCost?: number;
  status: 'Pending Review' | 'Quote Ready' | 'Accepted' | 'Rejected' | 'Paid';
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
};

export type Order = {
    id?: string;
    userId: string;
    quoteId: string;
    customerName: string;
    customerEmail: string;
    items: QuoteItem[];
    totalCost: number;
    shippingAddress: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: any; // Firestore Timestamp
};

export type UserProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
  roles: string[];
  createdAt: any; // Firestore Timestamp
};

export type Notification = {
    id?: string;
    userId: string;
    title: string;
    description: string;
    href?: string;
    isRead: boolean;
    createdAt: any; // Firestore Timestamp
};

export type StoreItem = {
  name: string;
  description: string;
  imageUrl: string;
};

export type StoreSettings = {
  id?: string;
  items: StoreItem[];
};


// Custom Order Settings Types
export type UnitOfMeasure = {
  name: string;
};

export type OptionalService = {
  id: string;
  label: string;
};

export type ShippingZone = {
  name: string;
  fee: number;
};

export type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type ExpenseCategory = {
    name: string;
};

export type AccountingSettings = {
    id?: string;
    expenseCategories: ExpenseCategory[];
}

export type CustomOrderSettings = {
    id?: string;
    unitsOfMeasure: UnitOfMeasure[];
    optionalServices: OptionalService[];
    shippingZones: ShippingZone[];
    suppliers: Supplier[];
};

// Purchase Order Types
export type PurchaseOrderItem = {
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
};

export type PurchaseOrder = {
  id?: string;
  poNumber: string;
  supplier: Supplier;
  issueDate: any; // Firestore Timestamp
  deliveryDate: any; // Firestore Timestamp
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number; // Can be a percentage or a flat amount
  shipping: number;
  total: number;
  status: 'Draft' | 'Issued' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: any;
};

// New Accounting Types
export type Expense = {
    id?: string;
    description: string;
    category: string;
    amount: number;
    date: any; // Firestore Timestamp
    receiptUrl?: string;
    createdAt: any; // Firestore Timestamp
}


// New Homepage and Footer Settings Types
export type FeaturedProduct = {
  imageUrl: string;
  description: string;
  price: string;
};

export type HomePageSettings = {
  id?: string;
  introMessage?: string;
  featuredProducts?: FeaturedProduct[];
  youtubeVideoUrl?: string;
  youtubeVideoDescription?: string;
  aboutUs?: string;
};

export type FooterSettings = {
  id?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  privacyPolicyLink?: string;
  termsLink?: string;
  cookiesPolicyLink?: string;
  address?: string;
  openingHours?: string;
};

    