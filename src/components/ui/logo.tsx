import * as React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md', ...props }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div
      className={cn(
        'font-bold tracking-tight flex items-center gap-1',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="relative">
        <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
          Panel
        </span>
        <span className="bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
          ingo
        </span>
        <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-400/50 to-purple-400/50 blur-sm" />
      </div>
    </div>
  );
} 