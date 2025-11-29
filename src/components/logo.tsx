import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <span className="text-xl font-bold font-headline tracking-tighter">
        BeautifulSoup&Foods
      </span>
    </Link>
  );
}
