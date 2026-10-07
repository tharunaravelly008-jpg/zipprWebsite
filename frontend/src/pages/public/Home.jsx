import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Bike, Car, Shield, CheckCircle } from 'lucide-react';

export const Home = () => {
  return (
    <div className="bg-brand-light dark:bg-brand-dark transition-colors duration-300">
      {/* Animated Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side info */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <span className="inline-flex self-center lg:self-start items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-indigo/10 text-brand-indigo dark:bg-brand-lime/10 dark:text-brand-lime">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo dark:bg-brand-lime animate-pulse"></span>
                Now Live in Your City
              </span>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Book Any Ride, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo via-brand-indigo to-brand-indigo dark:from-brand-lime dark:to-white">
                  Your Way.
                </span>
              </h1>
              
              <p className="text-lg text-brand-gray-500 max-w-xl mx-auto lg:mx-0">
                A premium, unified platform for bike, auto, and cab rides with transparent pricing, verified partners, and real-time tracking.
              </p>

              {/* Vehicle selectors/CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-brand-indigo hover:bg-brand-indigo/90 text-brand-lime dark:bg-brand-lime dark:hover:bg-brand-lime/90 dark:text-brand-indigo font-bold transition-all shadow-premium hover:-translate-y-0.5"
                >
                  Book a Zippr Ride
                </Link>
                <Link
                  to="/register?role=driver"
                  className="px-8 py-4 rounded-2xl border border-brand-indigo/15 hover:bg-brand-gray-100 dark:border-brand-light/10 dark:hover:bg-brand-gray-900 font-bold transition-all"
                >
                  Become a Partner
                </Link>
              </div>
            </div>

            {/* Right side graphical representation */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-brand-indigo to-brand-indigo/60 dark:from-brand-lime/20 dark:to-transparent flex items-center justify-center overflow-hidden border border-brand-indigo/5 p-8 shadow-premium">
                
                {/* Simulated map graphic */}
                <div className="absolute inset-0 bg-grid opacity-10"></div>
                
                {/* Premium Card Overlays */}
                <div className="relative z-10 w-full flex flex-col gap-4">
                  <div className="glass-panel p-6 rounded-2xl shadow-premium border border-white/20 flex items-center gap-4">
                    <div className="p-3 bg-brand-lime rounded-xl text-brand-indigo">
                      <Bike className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-gray-500 font-semibold uppercase">Zippr Bike</p>
                      <p className="text-lg font-bold">ETA 2 Mins · ₹35</p>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl shadow-premium border border-white/20 flex items-center gap-4 translate-x-4">
                    <div className="p-3 bg-brand-indigo rounded-xl text-brand-lime">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-gray-500 font-semibold uppercase text-brand-gray-400">Zippr Cab</p>
                      <p className="text-lg font-bold">ETA 5 Mins · ₹120</p>
                    </div>
                  </div>
                </div>

                {/* Accent glows */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-lime/30 rounded-full blur-3xl"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-indigo/40 rounded-full blur-3xl"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Safety Features */}
      <section className="py-16 bg-white dark:bg-brand-gray-950 border-y border-brand-indigo/5 dark:border-brand-light/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Why choose Zippr?</h2>
            <p className="text-brand-gray-500">We are committed to delivering safe, reliable, and premium quality transit options.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-brand-light dark:bg-brand-dark border border-brand-indigo/5 flex flex-col gap-4">
              <div className="w-12 h-12 bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Safety First</h3>
              <p className="text-sm text-brand-gray-500">Realtime tracking, emergency SOS assistance, and mandatory document verification for every Partner.</p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-light dark:bg-brand-dark border border-brand-indigo/5 flex flex-col gap-4">
              <div className="w-12 h-12 bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold">Transparent Pricing</h3>
              <p className="text-sm text-brand-gray-500">Know exactly what you pay before you request. No hidden convenience fees or mysterious charges.</p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-light dark:bg-brand-dark border border-brand-indigo/5 flex flex-col gap-4">
              <div className="w-12 h-12 bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo rounded-xl flex items-center justify-center">
                <Navigation className="w-6 h-6 rotate-45" />
              </div>
              <h3 className="font-heading text-xl font-bold">Fast Dispatch</h3>
              <p className="text-sm text-brand-gray-500">Our routing algorithm matches you with the nearest Partner in seconds to eliminate idle waiting time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
