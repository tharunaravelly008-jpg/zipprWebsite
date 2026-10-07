import React from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  wrapperClassName,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-brand-gray-700 dark:text-brand-gray-300 font-body"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-brand-gray-400 dark:text-brand-gray-500 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-white dark:bg-brand-dark/50 border border-brand-gray-200 dark:border-brand-gray-800 rounded-2xl px-4 py-2.5 text-brand-indigo dark:text-white placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo dark:focus:ring-brand-lime/30 dark:focus:border-brand-lime transition-all font-body',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-brand-gray-400 dark:text-brand-gray-500 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
