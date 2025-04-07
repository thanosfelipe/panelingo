'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for error in URL hash
    const hash = window.location.hash;
    if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
      setIsLinkExpired(true);
      setError('This password reset link has expired or is invalid.');
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLinkExpired) return;

    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Redirect to sign in with success message
      router.push('/auth?message=Password updated successfully. Please sign in.');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLinkExpired) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto mt-8 p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-6">
            Link Expired
          </h1>
          <p className="text-gray-300 mb-6">
            This password reset link has expired or is invalid. Please request a new password reset link.
          </p>
          <Button
            asChild
            className="w-full mb-4"
          >
            <Link href="/auth/reset-password">
              Request New Reset Link
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/auth">
              Back to Sign In
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto mt-8 p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-6">
          Update Your Password
        </h1>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}
          <div>
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
} 