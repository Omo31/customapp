'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import { ReactNode } from 'react';

const noHeaderFooterPaths = ['/login', '/signup'];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showHeaderFooter = !noHeaderFooterPaths.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {showHeaderFooter && <Header />}
      <main className="flex-1">{children}</main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
