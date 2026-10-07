import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Card, Input, Button } from '../../components/common';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Contact form submitted!');
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg text-brand-gray-500">
          Have a question or need support? We're here to help. Reach out to our team below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Card className="flex items-start gap-4 p-6">
            <div className="p-3 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded-xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold mb-1">Email Support</h3>
              <p className="text-brand-gray-500 mb-2">Our team responds within 24 hours.</p>
              <a href="mailto:support@zippr.com" className="font-semibold text-brand-indigo dark:text-brand-lime">support@zippr.com</a>
            </div>
          </Card>
          
          <Card className="flex items-start gap-4 p-6">
            <div className="p-3 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded-xl">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold mb-1">24/7 Helpline</h3>
              <p className="text-brand-gray-500 mb-2">For urgent safety concerns during a ride.</p>
              <a href="tel:1800-ZIPPR-SOS" className="font-semibold text-brand-indigo dark:text-brand-lime">1800-ZIPPR-SOS</a>
            </div>
          </Card>

          <Card className="flex items-start gap-4 p-6">
            <div className="p-3 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold mb-1">Headquarters</h3>
              <p className="text-brand-gray-500">123 Tech Park, Innovation Avenue<br />Bangalore, KA 560001</p>
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <h2 className="font-heading text-2xl font-bold mb-6">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" placeholder="John" required />
              <Input label="Last Name" placeholder="Doe" required />
            </div>
            <Input label="Email Address" type="email" placeholder="john@example.com" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-gray-700 dark:text-brand-gray-300 font-body">Message</label>
              <textarea 
                className="w-full bg-white dark:bg-brand-dark/50 border border-brand-gray-200 dark:border-brand-gray-800 rounded-2xl px-4 py-3 text-brand-indigo dark:text-white placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo dark:focus:ring-brand-lime/30 dark:focus:border-brand-lime transition-all font-body min-h-[120px] resize-y"
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>
            <Button type="submit" fullWidth className="mt-4">Send Message</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
