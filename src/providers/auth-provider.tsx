"use client";
import { AuthProvider as Provider } from '@/hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
