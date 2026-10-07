import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button, Input } from '../common';
import { cn } from '../../utils/cn';

export const RatingModal = ({ isOpen, onClose, onSubmit, driverName }) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedStar === 0) return;
    setIsSubmitting(true);
    await onSubmit({ stars: selectedStar, comment });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-brand-dark rounded-3xl p-6 shadow-2xl border border-brand-indigo/10 dark:border-brand-light/10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-brand-gray-900 transition-colors"
          >
            <X className="w-5 h-5 text-brand-gray-500" />
          </button>

          <div className="text-center mb-8 mt-4">
            <h2 className="text-2xl font-heading font-bold text-brand-indigo dark:text-brand-light mb-2">
              Rate your ride
            </h2>
            <p className="text-brand-gray-500 text-sm">
              How was your trip with {driverName || 'your driver'}?
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedStar(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-1"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors duration-200",
                    (hoveredStar || selectedStar) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-brand-gray-300 dark:text-brand-gray-700"
                  )}
                />
              </motion.button>
            ))}
          </div>

          <div className="mb-8">
            <textarea
              placeholder="Leave a comment (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-24 p-4 rounded-xl border border-brand-indigo/20 dark:border-brand-light/20 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo dark:focus:ring-brand-lime resize-none transition-all placeholder:text-brand-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={selectedStar === 0 || isSubmitting}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
