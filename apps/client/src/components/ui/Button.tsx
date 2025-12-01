import * as React from "react"
import { useEffect, useRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Use a consistent gradient to avoid hydration mismatch
// This ensures server and client render the same className
// Gold gradient colors - medium brightness with darker gradient
const defaultGoldGradient = "text-ivory shadow-md hover:shadow-lg transition-all";

// Inline style fallback for gradient
const goldGradientStyle: React.CSSProperties = {
  background: 'linear-gradient(to right, #FFF8E1, #FFE8A8)',
};

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-ivory shadow-md hover:shadow-lg transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Ensure gradient is applied for default variant
    const baseClasses = buttonVariants({ variant, size });
    let finalClassName: string;
    let finalStyle: React.CSSProperties | undefined;
    
    if (variant === 'default' || variant === undefined) {
      // For default variant, always apply consistent gold gradient
      // Use the same gradient on both server and client to avoid hydration mismatch
      finalClassName = cn(
        baseClasses,
        defaultGoldGradient,
        className
      );
      
      // Always apply inline style to ensure gradient is visible
      // This overrides any background-color from Tailwind
      // Soft gold gradient - gentle, not orange
      finalStyle = {
        backgroundImage: 'linear-gradient(to right, #F5E6A8, #E8C85A, #D4AF37)',
        backgroundColor: 'transparent',
        ...style, // User styles can override if needed
      };
      
      // Use ref to access DOM element directly
      const buttonRef = useRef<HTMLButtonElement | null>(null);
      
      // Apply gradient style after component mounts (client-side only)
      useEffect(() => {
        // Use setTimeout to ensure DOM is fully rendered
        const timer = setTimeout(() => {
          if (buttonRef.current && (variant === 'default' || variant === undefined)) {
            // Force apply gradient style directly to DOM with !important
            // Soft gold gradient - gentle, not orange
            const element = buttonRef.current;
            element.style.setProperty('background-image', 'linear-gradient(to right, #F5E6A8, #E8C85A, #D4AF37)', 'important');
            element.style.setProperty('background-color', 'transparent', 'important');
            // Also set as regular style property as fallback
            element.style.backgroundImage = 'linear-gradient(to right, #F5E6A8, #E8C85A, #D4AF37)';
            element.style.backgroundColor = 'transparent';
          }
        }, 0);
        return () => clearTimeout(timer);
      }, [variant]);
      
      // Combine refs
      const combinedRef = React.useCallback((node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      }, [ref]);
      
      return (
        <Comp
          className={cn(finalClassName, "golden-shimmer-full")}
          style={finalStyle}
          ref={combinedRef}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            if (target) {
              // Lighter hover gradient - soft gold
              target.style.setProperty('background-image', 'linear-gradient(to right, #FFE8A8, #F5E6A8, #E8C85A)', 'important');
            }
            props.onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            if (target) {
              // Soft gold default gradient
              target.style.setProperty('background-image', 'linear-gradient(to right, #F5E6A8, #E8C85A, #D4AF37)', 'important');
            }
            props.onMouseLeave?.(e);
          }}
          {...props}
        />
      );
    } else {
      finalClassName = cn(baseClasses, className);
      finalStyle = style;
    }
    
    return (
      <Comp
        className={finalClassName}
        style={finalStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
