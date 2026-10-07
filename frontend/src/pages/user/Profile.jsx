import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../features/auth/authSlice';
import { userApi } from '../../api/notificationsApi';
import axiosInstance from '../../api/axiosInstance';
import { Card, Button, Input } from '../../components/common';
import { User, Camera, CheckCircle, Loader2, Phone, Mail, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await axiosInstance.patch('/users/me', {
        name: form.name,
        phone: form.phone,
      });
      dispatch(updateUser(updated.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
    setSaving(false);
  };

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">My Profile</h1>
        <p className="text-brand-gray-500 mt-1">Manage your personal information.</p>
      </div>

      {/* Avatar section */}
      <Card className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-indigo to-brand-indigo/60 dark:from-brand-lime dark:to-brand-lime/60 flex items-center justify-center text-3xl font-bold text-brand-lime dark:text-brand-indigo shadow-lg">
            {initials}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-brand-gray-800 border-2 border-brand-gray-100 dark:border-brand-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-brand-indigo hover:border-brand-indigo hover:text-white dark:hover:bg-brand-lime dark:hover:text-brand-indigo transition-all">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="font-heading text-xl font-bold">{user?.name}</p>
          <p className="text-brand-gray-500 text-sm mt-0.5">{user?.email}</p>
          <span className={cn(
            'inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider',
            user?.role === 'driver'
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400'
              : user?.role === 'admin'
              ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
              : 'bg-brand-indigo/10 text-brand-indigo dark:bg-brand-lime/10 dark:text-brand-lime'
          )}>
            <Shield className="w-3 h-3" />
            {user?.role}
          </span>
        </div>
      </Card>

      {/* Edit Form */}
      <Card>
        <h2 className="font-heading text-lg font-bold mb-6">Edit Information</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-brand-gray-600 dark:text-brand-gray-400">Full Name</label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              leftIcon={<User className="w-4 h-4 text-brand-gray-400" />}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-brand-gray-600 dark:text-brand-gray-400">Email Address</label>
            <Input
              value={form.email}
              disabled
              leftIcon={<Mail className="w-4 h-4 text-brand-gray-400" />}
              placeholder="Email (cannot be changed)"
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-brand-gray-400 mt-1.5">Email cannot be changed for security reasons.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-brand-gray-600 dark:text-brand-gray-400">Phone Number</label>
            <Input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              leftIcon={<Phone className="w-4 h-4 text-brand-gray-400" />}
              placeholder="+91 98765 43210"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl">{error}</p>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold bg-green-50 dark:bg-green-500/10 p-3 rounded-xl">
              <CheckCircle className="w-4 h-4" /> Profile saved successfully!
            </div>
          )}

          <Button type="submit" isLoading={saving} disabled={saving} className="self-start">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
