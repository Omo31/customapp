export type User = {
  uid: string;
  email: string | null;
  firstName: string;
  lastName:string;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
};
