import React from 'react';
import { Users, Target, Zap } from 'lucide-react';
import { Card } from '../../components/common';

const About = () => {
  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">About Zippr</h1>
        <p className="text-lg text-brand-gray-500">
          We are redefining urban mobility. Zippr provides a seamless, premium experience connecting riders with verified partners across the city.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <Card className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-xl font-bold">Our Mission</h3>
          <p className="text-brand-gray-500 text-sm">To make city commutes faster, safer, and more affordable for everyone, while empowering our driver partners.</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-xl font-bold">Community First</h3>
          <p className="text-brand-gray-500 text-sm">We believe in treating our riders and partners with equal respect, creating a community of trust.</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-xl font-bold">Innovation</h3>
          <p className="text-brand-gray-500 text-sm">Using cutting-edge tech to optimize routes, reduce wait times, and provide a premium app experience.</p>
        </Card>
      </div>

      <div className="bg-brand-indigo dark:bg-brand-gray-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-premium">
        <div className="max-w-xl mb-8 md:mb-0">
          <h2 className="font-heading text-3xl font-bold mb-4">Join the journey</h2>
          <p className="text-brand-gray-300">Whether you're looking for a quick ride to work or want to earn on your own schedule, there's a place for you at Zippr.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <a href="/register" className="px-6 py-3 bg-brand-lime text-brand-indigo font-bold rounded-xl hover:bg-opacity-90 transition-all text-center flex-1 md:flex-none">Ride with us</a>
          <a href="/register?role=driver" className="px-6 py-3 border-2 border-brand-lime text-brand-lime font-bold rounded-xl hover:bg-brand-lime/10 transition-all text-center flex-1 md:flex-none">Drive with us</a>
        </div>
      </div>
    </div>
  );
};

export default About;
