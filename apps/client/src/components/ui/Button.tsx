import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Use a consistent gradient to avoid hydration mismatch
const defaultGoldGradient = 'text-ivory shadow-md hover:shadow-lg transition-all';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-ivory shadow-md hover:shadow-lg transition-all',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const isDefaultVariant = variant === 'default' || variant === undefined;

    // Combine refs - always called unconditionally
    const combinedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref],
    );

    // Apply gradient style after component mounts - always called unconditionally
    useEffect(() => {
      if (!isDefaultVariant || !buttonRef.current) {
        return;
      }

      const timer = setTimeout(() => {
        if (buttonRef.current) {
          const element = buttonRef.current;
          element.style.setProperty(
            'background-image',
            'linear-gradient(to right, #F5E6A8, #E8C85A, #D4AF37)',
            'important',
          );
          element.style.setProperty('background-color', 'transparent', 'important');
        }
      }, 0);

      return () => clearTimeout(timer);
    }, [isDefaultVariant]);

    // Calculate classes and styles
    const baseClasses = buttonVariants({ variant, size });

    if (isDefaultVariant) {
      const finalClassName = cn(baseClasses, defaultGoldGradient, 'golden-shimmer-full', className);

      const finalStyle: React.CSSProperties = {
        backgroundImage: 'linear-gradient(to right, #F5E6A8, #E8C85A, #D4AF37)',
        backgroundColor: 'transparent',
        ...style,
      };

      return (
        <Comp
          className={finalClassName}
          style={finalStyle}
          ref={combinedRef}
          onMouseEnter={e => {
            const target = e.currentTarget as HTMLElement;
            if (target) {
              target.style.setProperty(
                'background-image',
                'linear-gradient(to right, #FFE8A8, #F5E6A8, #E8C85A)',
                'important',
              );
            }
            props.onMouseEnter?.(e);
          }}
          onMouseLeave={e => {
            const target = e.currentTarget as HTMLElement;
            if (target) {
              target.style.setProperty(
                'background-image',
                'linear-gradient(to right, #F5E6A8, #E8C85A, #D4AF37)',
                'important',
              );
            }
            props.onMouseLeave?.(e);
          }}
          {...props}
        />
      );
    }

    return <Comp className={cn(baseClasses, className)} style={style} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
