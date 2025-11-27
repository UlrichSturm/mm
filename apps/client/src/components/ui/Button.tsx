import * as React from "react"
import { useEffect, useRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const goldGradientPairs = [
  { base: "bg-gradient-to-r from-[#D4AF37] to-[#CBA135]", hover: "hover:from-[#CBA135] hover:to-[#F5E6A8]" },
  { base: "bg-gradient-to-r from-[#F5E6A8] via-[#D4AF37] to-[#B8941F]", hover: "hover:from-[#D4AF37] hover:via-[#F5E6A8] hover:to-[#CBA135]" },
  { base: "bg-gradient-to-r from-[#B8941F] via-[#D4AF37] to-[#CBA135]", hover: "hover:from-[#D4AF37] hover:via-[#F5E6A8] hover:to-[#B8941F]" },
  { base: "bg-gradient-to-r from-[#CBA135] via-[#F5E6A8] to-[#D4AF37]", hover: "hover:from-[#F5E6A8] hover:via-[#D4AF37] hover:to-[#CBA135]" },
  { base: "bg-gradient-to-r from-[#D4AF37] via-[#B8941F] to-[#8B6F1A]", hover: "hover:from-[#CBA135] hover:via-[#D4AF37] hover:to-[#F5E6A8]" },
  { base: "bg-gradient-to-br from-[#D4AF37] to-[#CBA135]", hover: "hover:from-[#F5E6A8] hover:to-[#D4AF37]" },
  { base: "bg-gradient-to-bl from-[#F5E6A8] via-[#D4AF37] to-[#B8941F]", hover: "hover:from-[#D4AF37] hover:via-[#F5E6A8] hover:to-[#CBA135]" },
  { base: "bg-gradient-to-tr from-[#B8941F] via-[#D4AF37] to-[#F5E6A8]", hover: "hover:from-[#CBA135] hover:via-[#F5E6A8] hover:to-[#D4AF37]" },
];

function getRandomGradientClass() {
  const index = Math.floor(Math.random() * goldGradientPairs.length);
  const pair = goldGradientPairs[index];
  // Ensure gradient classes are properly applied
  return `${pair.base} ${pair.hover} text-ivory shadow-md hover:shadow-lg transition-all`;
}

// Fallback gradient class - using inline style as backup
const defaultGoldGradient = "bg-gradient-to-r from-[#D4AF37] to-[#CBA135] hover:from-[#CBA135] hover:to-[#F5E6A8] text-ivory";

// Inline style fallback for gradient
const goldGradientStyle: React.CSSProperties = {
  background: 'linear-gradient(to right, #D4AF37, #CBA135)',
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
    const [gradientClass] = React.useState(() => {
      if (variant === 'default' || variant === undefined) {
        return getRandomGradientClass();
      }
      return '';
    });
    
    // Ensure gradient is applied for default variant
    const baseClasses = buttonVariants({ variant, size });
    let finalClassName: string;
    let finalStyle: React.CSSProperties | undefined;
    
    if (variant === 'default' || variant === undefined) {
      // For default variant, always apply gold gradient
      const gradient = gradientClass || defaultGoldGradient;
      finalClassName = cn(
        baseClasses,
        gradient,
        className
      );
      
      // Always apply inline style to ensure gradient is visible
      // This overrides any background-color from Tailwind
      finalStyle = {
        backgroundImage: 'linear-gradient(to right, #D4AF37, #CBA135)',
        backgroundColor: 'transparent',
        ...style, // User styles can override if needed
      };
      
      // Use ref to access DOM element directly
      const buttonRef = useRef<HTMLButtonElement | null>(null);
      
      // Apply gradient style after component mounts
      useEffect(() => {
        // Use setTimeout to ensure DOM is fully rendered
        const timer = setTimeout(() => {
          if (buttonRef.current && (variant === 'default' || variant === undefined)) {
            // Force apply gradient style directly to DOM with !important
            const element = buttonRef.current;
            element.style.setProperty('background-image', 'linear-gradient(to right, #D4AF37, #CBA135)', 'important');
            element.style.setProperty('background-color', 'transparent', 'important');
            // Also set as regular style property as fallback
            element.style.backgroundImage = 'linear-gradient(to right, #D4AF37, #CBA135)';
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
              target.style.setProperty('background-image', 'linear-gradient(to right, #CBA135, #F5E6A8)', 'important');
            }
            props.onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            if (target) {
              target.style.setProperty('background-image', 'linear-gradient(to right, #D4AF37, #CBA135)', 'important');
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
