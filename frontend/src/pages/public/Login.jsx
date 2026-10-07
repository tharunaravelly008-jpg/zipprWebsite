import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginUser } from '../../features/auth/authSlice';
import { Navigation, Loader2 } from 'lucide-react';
import { Input, Button } from '../../components/common';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(loginUser(data)).unwrap();
      const role = resultAction.user.role;
      
      // Redirect based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'driver') navigate('/driver');
      else navigate(from, { replace: true });
    } catch (err) {
      // Error is handled in Redux state, which will display below
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2">
      {/* Form Container */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white dark:bg-brand-dark">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-brand-gray-500 text-sm">Log in to book a ride or manage your profile</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 text-red-600 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-brand-gray-700 dark:text-brand-gray-300 font-body" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-indigo dark:text-brand-lime hover:underline">Forgot?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-brand-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-indigo dark:text-brand-lime hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>

      {/* Graphic Illustration Container */}
      <div className="hidden lg:flex bg-brand-indigo dark:bg-brand-gray-950 items-center justify-center p-12 relative overflow-hidden border-l border-brand-indigo/5 dark:border-brand-light/5">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-lime/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-indigo/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center flex flex-col gap-6 max-w-md items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-lime flex items-center justify-center shadow-premium">
            <Navigation className="w-8 h-8 text-brand-indigo rotate-45" />
          </div>
          <h3 className="font-heading text-3xl font-bold text-brand-lime dark:text-brand-lime">Fastest Dispatch Network</h3>
          <p className="text-brand-gray-400 text-sm">
            Access thousands of bikes, autos, and cabs at your disposal. Log in to access rates and matches near your current position.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
