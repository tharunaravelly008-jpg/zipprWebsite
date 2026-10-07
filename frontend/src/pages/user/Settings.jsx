import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../features/ui/uiSlice';
import { Card, Button } from '../../components/common';
import { Sun, Moon, Bell, Shield, Globe, HelpCircle, ChevronRight, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={cn(
      'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
      enabled ? 'bg-brand-indigo dark:bg-brand-lime' : 'bg-brand-gray-300 dark:bg-brand-gray-700'
    )}
  >
    <span className={cn(
      'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
      enabled ? 'translate-x-6' : 'translate-x-1'
    )} />
  </button>
);

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const theme = useSelector(s => s.ui.theme);

  const [settings, setSettings] = useState({
    rideNotifications: true,
    promoEmails: false,
    locationSharing: true,
    twoFactorAuth: false,
    language: 'English',
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const SECTIONS = [
    {
      title: 'Appearance',
      icon: Sun,
      items: [
        {
          label: 'Dark Mode',
          desc: 'Switch between light and dark interface',
          control: <Toggle enabled={theme === 'dark'} onToggle={() => dispatch(toggleTheme())} />,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Ride Updates',
          desc: 'Get notified about your booking status',
          control: <Toggle enabled={settings.rideNotifications} onToggle={() => toggle('rideNotifications')} />,
        },
        {
          label: 'Promotions & Offers',
          desc: 'Receive deals and discount alerts via email',
          control: <Toggle enabled={settings.promoEmails} onToggle={() => toggle('promoEmails')} />,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Location Sharing',
          desc: 'Allow Zippr to use your location for booking',
          control: <Toggle enabled={settings.locationSharing} onToggle={() => toggle('locationSharing')} />,
        },
        {
          label: 'Two-Factor Auth',
          desc: 'Extra security layer for your account',
          control: <Toggle enabled={settings.twoFactorAuth} onToggle={() => toggle('twoFactorAuth')} />,
        },
      ],
    },
    {
      title: 'Language & Region',
      icon: Globe,
      items: [
        {
          label: 'App Language',
          desc: 'Choose your preferred display language',
          control: (
            <span className="text-sm font-semibold text-brand-indigo dark:text-brand-lime flex items-center gap-1">
              {settings.language} <ChevronRight className="w-4 h-4" />
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-brand-gray-500 mt-1">Customize your Zippr experience.</p>
      </div>

      {SECTIONS.map((section) => {
        const SectionIcon = section.icon;
        return (
          <Card key={section.title} padding="none" className="overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-brand-indigo/5 dark:border-brand-gray-800">
              <div className="p-2 rounded-xl bg-brand-indigo/5 dark:bg-brand-lime/5">
                <SectionIcon className="w-5 h-5 text-brand-indigo dark:text-brand-lime" />
              </div>
              <h2 className="font-heading font-bold">{section.title}</h2>
            </div>
            <div className="divide-y divide-brand-indigo/5 dark:divide-brand-gray-800">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-5 gap-4">
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-brand-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  {item.control}
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Help & Support */}
      <Card className="flex items-center justify-between cursor-pointer hover:shadow-premium transition-shadow group">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-indigo/5 dark:bg-brand-lime/5">
            <HelpCircle className="w-5 h-5 text-brand-indigo dark:text-brand-lime" />
          </div>
          <div>
            <p className="font-semibold text-sm">Help & Support</p>
            <p className="text-xs text-brand-gray-500 mt-0.5">FAQs, contact us, and report issues</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-brand-gray-400 group-hover:text-brand-indigo dark:group-hover:text-brand-lime transition-colors" />
      </Card>

      <p className="text-center text-xs text-brand-gray-400 pb-4">
        Zippr v0.1.0 · Built with ♥ in India
      </p>
    </div>
  );
};

export default SettingsPage;
