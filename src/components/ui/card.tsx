import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-gray-800 bg-gray-900/50 text-gray-100 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/80 hover:shadow-2xl hover:shadow-indigo-500/10',
      className
    )}
    {...props}
  />
));

Card.displayName = 'Card';

export { Card }; 