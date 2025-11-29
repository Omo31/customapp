'use client'
 
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h2 className="text-3xl font-bold font-headline mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We're sorry, but an unexpected error occurred. You can try to go back or refresh the page.
      </p>
      <Button onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
