'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './app-sidebar';

const noHeaderFooterPaths = ['/login', '/signup'];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showLayout = !noHeaderFooterPaths.includes(pathname);

  if (!showLayout) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 overflow-y-auto">{children}</main>
                <Footer />
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
