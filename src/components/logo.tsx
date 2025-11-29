import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <BrainCircuit className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold font-headline tracking-tighter">
        VisionVerseAI
      </span>
    </Link>
  );
}
