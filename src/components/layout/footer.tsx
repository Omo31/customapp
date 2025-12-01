
'use client';

import { Logo } from '../logo';
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { type FooterSettings } from '@/types';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const db = useFirestore();
  const { data: settings } = useDoc<FooterSettings>(db, 'settings', 'footer');

  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Logo />
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} BeautifulSoup&Foods. <br /> All rights reserved.
            </p>
          </div>

          {/* Social and Legal */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Social Links */}
            <div>
              <h3 className="font-semibold mb-4 text-center sm:text-left">Follow Us</h3>
              <div className="flex justify-center sm:justify-start space-x-4">
                {settings?.socialLinks?.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                 {settings?.socialLinks?.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                 {settings?.socialLinks?.youtube && (
                  <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>

            {/* Address & Hours */}
            <div>
               <h3 className="font-semibold mb-4 text-center sm:text-left">Contact Us</h3>
               <div className="text-sm text-muted-foreground space-y-2 text-center sm:text-left">
                {settings?.address && <p className="whitespace-pre-line">{settings.address}</p>}
                {settings?.openingHours && <p className="whitespace-pre-line">{settings.openingHours}</p>}
               </div>
            </div>

            {/* Legal Links */}
            <div>
               <h3 className="font-semibold mb-4 text-center sm:text-left">Legal</h3>
                <nav className="flex flex-col space-y-2 items-center sm:items-start">
                    {settings?.privacyPolicyLink && <Link href={settings.privacyPolicyLink} className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>}
                    {settings?.termsLink && <Link href={settings.termsLink} className="text-sm text-muted-foreground hover:text-primary">Terms & Conditions</Link>}
                    {settings?.cookiesPolicyLink && <Link href={settings.cookiesPolicyLink} className="text-sm text-muted-foreground hover:text-primary">Cookies Policy</Link>}
                </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
