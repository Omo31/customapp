export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
};

export type GeneratedImage = {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
};
