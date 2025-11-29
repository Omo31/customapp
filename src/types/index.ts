export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  roles?: string[];
  isAdmin?: boolean; // For backwards compatibility during transition
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
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
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
