'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }: { children: ReactNode, requiredRole?: string }) {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (requiredRole && !hasRole(requiredRole)) {
        // Logged in, but does not have the required role
        router.push('/'); // Or redirect to an 'unauthorized' page
      }
    }
  }, [user, loading, router, requiredRole, hasRole]);

  if (loading || !user || (requiredRole && !hasRole(requiredRole))) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
