import React from 'react';
import { cn } from '@/utils/cn';

export const Card = ({
  children,
  className,
  glass = false,
  padding = 'md',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={cn(
        'rounded-3xl',
        glass ? 'glass-panel shadow-glass' : 'bg-white dark:bg-brand-dark border border-brand-gray-100 dark:border-brand-gray-800 shadow-premium dark:shadow-premium-dark',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
