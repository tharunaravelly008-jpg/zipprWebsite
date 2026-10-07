import React from 'react';
import { cn } from '@/utils/cn';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-brand-gray-200 dark:bg-brand-gray-800 rounded-xl',
        className
      )}
      {...props}
    />
  );
};

export const SkeletonCard = () => (
  <div className="p-6 bg-white dark:bg-brand-dark rounded-3xl border border-brand-gray-100 dark:border-brand-gray-800 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-2xl" />
    <div className="flex justify-between pt-4">
      <Skeleton className="h-8 w-[100px] rounded-xl" />
      <Skeleton className="h-8 w-[100px] rounded-xl" />
    </div>
  </div>
);
