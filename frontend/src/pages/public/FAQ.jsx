import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/common';
import { cn } from '../../utils/cn';

const faqs = [
  {
    question: 'How do I book a ride?',
    answer: 'Simply download the Zippr app, create an account, enter your destination, and choose your preferred vehicle type (Bike, Auto, or Cab). Tap confirm and a partner will be on their way.'
  },
  {
    question: 'Are Zippr partners verified?',
    answer: 'Yes, absolutely. Every Zippr Partner goes through a rigorous background check and document verification process before they can accept rides on our platform.'
  },
  {
    question: 'How does pricing work?',
    answer: 'Zippr uses upfront pricing. The price you see before confirming the booking is the price you pay. Pricing is calculated based on distance, time, and current demand.'
  },
  {
    question: 'How can I become a Zippr Partner?',
    answer: 'Click on the "Become a Partner" button on our homepage or select the "Partner" role during signup. You will need a valid driver\'s license, vehicle registration, and insurance.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards, UPI, and our built-in Zippr Wallet for a seamless, cashless experience.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
        <p className="text-lg text-brand-gray-500">Everything you need to know about riding and driving with Zippr.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <Card 
              key={index} 
              className={cn("cursor-pointer transition-all", isOpen ? "border-brand-indigo dark:border-brand-lime" : "")}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-semibold text-lg">{faq.question}</h3>
                {isOpen ? <ChevronUp className="w-5 h-5 text-brand-indigo dark:text-brand-lime" /> : <ChevronDown className="w-5 h-5 text-brand-gray-400" />}
              </div>
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-brand-gray-100 dark:border-brand-gray-800 text-brand-gray-600 dark:text-brand-gray-400">
                  {faq.answer}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
