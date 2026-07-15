
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Utensils } from 'lucide-react';

type LogoProps = {
  className?: string;
  hideText?: boolean;
};

export function Logo({ className, hideText = false }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Utensils className="h-5 w-5" />
      </div>
      {!hideText && (
        <span className="text-xl font-bold font-headline tracking-tighter">
          BeautifulSoup&Foods
        </span>
      )}
    </Link>
  );
}
