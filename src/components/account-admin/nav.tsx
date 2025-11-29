'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface NavProps {
  items: {
    href: string
    title: string
  }[]
  title: string
}

export function Nav({ items, title }: NavProps) {
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const navItems = (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => (
        <Link key={index} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent"
            )}
          >
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  )

  if (isDesktop) {
    return (
      <aside className="w-64">
        <h2 className="text-lg font-semibold tracking-tight font-headline mb-4">{title}</h2>
        {navItems}
      </aside>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden mb-4">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="font-headline">{title}</SheetTitle>
        </SheetHeader>
        <div className="py-4">{navItems}</div>
      </SheetContent>
    </Sheet>
  )
}
