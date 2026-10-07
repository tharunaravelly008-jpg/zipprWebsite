import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const variants = {
  primary: 'bg-brand-lime text-brand-indigo hover:bg-[#b5f02c] shadow-premium',
  secondary: 'bg-brand-indigo text-white hover:bg-opacity-90 shadow-premium',
  outline: 'border-2 border-brand-indigo text-brand-indigo dark:border-brand-light dark:text-brand-light hover:bg-brand-indigo/5',
  ghost: 'text-brand-indigo dark:text-brand-light hover:bg-brand-indigo/10 dark:hover:bg-brand-light/10',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-premium',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg font-medium',
  icon: 'p-2',
};

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  fullWidth = false,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-body transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:ring-offset-2 dark:focus:ring-offset-brand-dark',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';
