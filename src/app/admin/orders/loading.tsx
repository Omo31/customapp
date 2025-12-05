
"use client"

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>
       <Card>
        <CardHeader>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(PAGE_SIZE)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
            </div>
        </CardContent>
         <CardFooter>
            <Skeleton className="h-10 w-64" />
        </CardFooter>
      </Card>
    </div>
  )
}

