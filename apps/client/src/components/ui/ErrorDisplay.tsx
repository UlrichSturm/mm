import * as React from "react"
import { Button } from "./Button"

interface ErrorDisplayProps {
  error: Error
  onRetry?: () => void
  title?: string
}

export function ErrorDisplay({ error, onRetry, title = "Error" }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h3 className="text-lg font-semibold text-destructive mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
      )}
    </div>
  )
}

