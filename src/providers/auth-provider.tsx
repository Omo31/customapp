"use client";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
