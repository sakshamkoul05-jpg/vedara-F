import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground border border-border',
        outline: 'border-2 border-primary text-primary',
        success: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30',
        danger: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge: React.FC<BadgeProps> = ({ className, variant, size, ...props }) => {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
};
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
