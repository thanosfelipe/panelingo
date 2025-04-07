'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>(() => {
    const urlMode = searchParams.get('mode');
    return urlMode === 'signup' ? 'signup' : 'signin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clear password when mode changes
  useEffect(() => {
    setPassword('');
    setError(null);
  }, [mode]);

  // Check for success message in URL
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccess(message);
      // Clear the message from URL after showing it
      router.replace('/auth');
    }
  }, [searchParams, router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Check if user has a username
      const checkUsername = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (profile && !profile.username) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      };
      
      checkUsername();
    }
  }, [user, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        // Handle specific error cases
        if (result.error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw result.error;
      }

      // If sign up was successful, user will be automatically signed in
      if (mode === 'signup' && result.data?.user) {
        // Check if user has a username before redirecting
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', result.data.user.id)
          .single();
        
        if (!profile?.username) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else if (mode === 'signin') {
        // Check if user has a username before redirecting
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', result.data.user?.id)
          .single();
        
        if (profile && !profile.username) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
      // If the error is about an existing user, switch to sign in mode
      if (err.message.includes('already registered')) {
        setMode('signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  // If user is already logged in, show loading state
  if (user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {success && (
            <div className="text-sm text-center text-green-400 bg-green-400/10 rounded-md py-2">
              {success}
            </div>
          )}

          <div className="mt-8 space-y-6">
            <Button
              type="button"
              variant="outline"
              className="w-full space-x-2 bg-transparent"
              onClick={handleGoogleAuth}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400 bg-gray-900">Or continue with email</span>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
              <div className="space-y-4 rounded-md">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={mode === 'signin' ? 'Enter your email to sign in' : 'Enter your email to create account'}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={mode === 'signin' ? 'Enter your password to sign in' : 'Create a password (min. 6 characters)'}
                    minLength={6}
                  />
                </div>
                {mode === 'signin' && (
                  <div className="flex justify-end">
                    <Link
                      href="/auth/reset-password"
                      className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-center text-red-400 bg-red-400/10 rounded-md py-2 border border-red-400/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 