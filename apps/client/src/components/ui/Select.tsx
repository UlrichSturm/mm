import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  getLabel: (value: string) => string | undefined
  setLabel: (value: string, label: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const labelsMapRef = React.useRef<Map<string, string>>(new Map())
  
  const getLabel = React.useCallback((val: string) => {
    return labelsMapRef.current.get(val)
  }, [])
  
  const setLabel = React.useCallback((val: string, label: string) => {
    labelsMapRef.current.set(val, label)
  }, [])
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, getLabel, setLabel }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context?.setOpen(!context.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <span className="ml-2">▼</span>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext)
  
  if (!context) {
    return <span>{placeholder}</span>
  }
  
  const label = context.getLabel(context.value)
  const displayText = label || (context.value === 'all' ? placeholder : context.value) || placeholder
  
  return <span>{displayText}</span>
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  if (!context?.open) {
    return null
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  React.useEffect(() => {
    if (context && typeof children === 'string') {
      context.setLabel(value, children)
    } else if (context && React.isValidElement(children)) {
      const text = extractTextFromChildren(children)
      if (text) {
        context.setLabel(value, text)
      }
    }
  }, [context, value, children])
  
  const handleClick = () => {
    context?.onValueChange(value)
    context?.setOpen(false)
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        context?.value === value && "bg-accent",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

function extractTextFromChildren(children: React.ReactNode): string | null {
  if (typeof children === 'string') {
    return children
  }
  if (typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).filter(Boolean).join('') || null
  }
  if (React.isValidElement(children) && children.props.children) {
    return extractTextFromChildren(children.props.children)
  }
  return null
}

