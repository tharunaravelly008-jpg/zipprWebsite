import React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerUser } from '../../features/auth/authSlice';
import { Navigation, Loader2 } from 'lucide-react';
import { Input, Button } from '../../components/common';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['user', 'driver']),
});

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state) => state.auth);

  const defaultRole = searchParams.get('role') === 'driver' ? 'driver' : 'user';

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(registerUser(data)).unwrap();
      const role = resultAction.user.role;

      if (role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2">
      {/* Graphic Illustration Container */}
      <div className="hidden lg:flex bg-brand-indigo dark:bg-brand-gray-950 items-center justify-center p-12 relative overflow-hidden border-r border-brand-indigo/5 dark:border-brand-light/5 order-last lg:order-first">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-lime/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-indigo/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center flex flex-col gap-6 max-w-md items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-lime flex items-center justify-center shadow-premium">
            <Navigation className="w-8 h-8 text-brand-indigo rotate-45" />
          </div>
          <h3 className="font-heading text-3xl font-bold text-brand-lime dark:text-brand-lime">Join the Movement</h3>
          <p className="text-brand-gray-400 text-sm">
            Sign up today as a Rider to commute anywhere conveniently, or as a Partner to start earning at your own convenience.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white dark:bg-brand-dark">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-brand-gray-500 text-sm">Join the Zippr transit community in a few steps</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 text-red-600 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Role selector tab style */}
            <div className="grid grid-cols-2 p-1.5 bg-brand-light dark:bg-brand-gray-900 rounded-xl gap-2 border border-brand-gray-200 dark:border-brand-gray-800">
              <button
                type="button"
                onClick={() => setValue('role', 'user')}
                className={`py-3 rounded-lg text-sm font-semibold transition-all ${selectedRole === 'user' ? 'bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo shadow' : 'text-brand-gray-500 hover:text-brand-indigo dark:hover:text-brand-light'}`}
              >
                Rider
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'driver')}
                className={`py-3 rounded-lg text-sm font-semibold transition-all ${selectedRole === 'driver' ? 'bg-brand-indigo text-brand-lime dark:bg-brand-lime dark:text-brand-indigo shadow' : 'text-brand-gray-500 hover:text-brand-indigo dark:hover:text-brand-light'}`}
              >
                Partner
              </button>
            </div>

            <Input
              label="Full Name"
              type="text"
              placeholder="Priya Sharma"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="priya@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="text"
              placeholder="9876543210"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              className="mt-2"
            >
              Sign Up
            </Button>
          </form>

          <p className="text-center text-sm text-brand-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-indigo dark:text-brand-lime hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
