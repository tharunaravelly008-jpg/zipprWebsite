import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-light dark:bg-brand-dark text-brand-indigo dark:text-brand-light text-center">
      <div className="max-w-md flex flex-col gap-6 items-center">
        <div className="p-4 bg-brand-indigo/5 dark:bg-brand-lime/5 rounded-2xl text-brand-indigo dark:text-brand-lime">
          <HelpCircle className="w-16 h-16 stroke-1 animate-bounce" />
        </div>
        <div>
          <h1 className="font-heading text-6xl font-bold mb-2">404</h1>
          <p className="text-lg font-bold">Page Not Found</p>
          <p className="text-sm text-brand-gray-500 mt-2">
            The page you are looking for does not exist or has been relocated by platform administrators.
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3.5 bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo font-bold rounded-xl transition-all shadow hover:opacity-90 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
