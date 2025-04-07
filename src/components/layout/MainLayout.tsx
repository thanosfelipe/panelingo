'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Metadata } from 'next';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Home, BookOpen, Award, Trophy } from 'lucide-react';
import { calculateUserLevel } from '@/lib/userStats';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';

export const metadata: Metadata = {
  title: 'Panelingo - Master Your Panellinies',
  description: 'Your personalized learning platform for Greek university entrance exams. Practice, learn, and succeed with interactive exercises and comprehensive study materials.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  themeColor: '#111827',
  viewport: 'width=device-width, initial-scale=1',
  applicationName: 'Panelingo',
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/auth';
  const isPasswordResetPage = pathname === '/auth/reset-password';
  const isUpdatePasswordPage = pathname === '/auth/update-password';
  const shouldHideAuthButtons = isAuthPage || isPasswordResetPage || isUpdatePasswordPage;
  const [userXp, setUserXp] = useState(0);
  const [isLoadingXp, setIsLoadingXp] = useState(true);
  
  // Calculate user level
  const userLevel = calculateUserLevel(userXp);

  useEffect(() => {
    const fetchUserXp = async () => {
      if (!user) return;
      
      try {
        setIsLoadingXp(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('xp_points')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setUserXp(data?.xp_points || 0);
      } catch (error) {
        console.error('Error fetching user XP:', error);
      } finally {
        setIsLoadingXp(false);
      }
    };

    fetchUserXp();
  }, [user]);

  // Store level in localStorage to prevent flicker during navigation
  useEffect(() => {
    if (!isLoadingXp && user) {
      // Save level data to localStorage
      localStorage.setItem('userLevelData', JSON.stringify({
        level: userLevel.level,
        progressPercent: userLevel.progressPercent,
        currentXp: userLevel.currentXp,
        requiredXp: userLevel.requiredXp,
        timestamp: Date.now()
      }));
    }
  }, [userXp, isLoadingXp, user, userLevel]);

  // Get cached level data from localStorage
  const getCachedLevel = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem('userLevelData');
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      // Only use cache if it's less than 5 minutes old
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  // Use cached level data if available and still loading
  const cachedLevel = getCachedLevel();
  const displayLevel = isLoadingXp && cachedLevel ? cachedLevel : userLevel;
  
  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('userLevelData');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-16 sm:pb-0">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <Logo size="md" />
              </Link>
            </div>

            {/* Navigation buttons for both desktop and mobile */}
            {user && (
              <div className="hidden sm:flex items-center ml-6 space-x-8">
                <Link href="/dashboard" className="flex flex-col items-center justify-center">
                  <Home className={`h-5 w-5 ${pathname === '/dashboard' ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span className="text-xs mt-1 font-medium text-gray-400">Home</span>
                </Link>
                <Link href="/lessons" className="flex flex-col items-center justify-center">
                  <BookOpen className={`h-5 w-5 ${pathname.startsWith('/lessons') ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span className="text-xs mt-1 font-medium text-gray-400">Lessons</span>
                </Link>
                <Link href="/goals" className="flex flex-col items-center justify-center">
                  <Trophy className={`h-5 w-5 ${pathname === '/goals' ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span className="text-xs mt-1 font-medium text-gray-400">Goals</span>
                </Link>
                <Link 
                  href="/profile" 
                  className="flex flex-col items-center"
                >
                  <div className={`h-8 w-8 rounded-full ${pathname === '/profile' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-700'} flex items-center justify-center text-white overflow-hidden`}>
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 font-medium text-gray-400">Me</span>
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {!user && !shouldHideAuthButtons && (
                <div className="flex items-center gap-4">
                  <Button
                    asChild
                    variant="outline"
                    className="text-sm font-medium"
                  >
                    <Link href="/auth">
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="text-sm font-medium"
                  >
                    <Link href="/auth">
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
              {user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Level indicator - visible on both mobile and desktop */}
                  <div className="flex items-center gap-2">
                    <Link href="/profile" className="flex flex-col items-center">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                        {isLoadingXp && !cachedLevel ? "..." : displayLevel.level}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 hidden sm:inline-block">Level</span>
                    </Link>
                    
                    {/* Progress Bar - now visible on both mobile and desktop with explicit styling */}
                    <div className="w-14 sm:w-24">
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                          style={{ width: `${displayLevel.progressPercent}%` }}
                        />
                      </div>
                      <div className="hidden sm:flex justify-between mt-0.5">
                        <span className="text-[10px] text-gray-500">{displayLevel.currentXp}</span>
                        <span className="text-[10px] text-gray-500">{displayLevel.requiredXp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Border separator for desktop only */}
                  <div className="hidden sm:block h-8 w-px bg-gray-700 mx-1"></div>
                  
                  <span className="hidden sm:inline-flex text-sm text-indigo-400 font-medium">
                    Welcome, {user.email?.split('@')[0] || 'User'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </nav>
      </header>

      <main className="relative pt-8 sm:pt-12">
        {children}
      </main>

      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <Logo size="sm" />
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} Panelingo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation - Instagram style */}
      {user && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900/90 backdrop-blur-lg z-50">
          <div className="flex justify-around items-center h-16">
            <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full">
              <Home className={`h-6 w-6 ${pathname === '/dashboard' ? 'text-indigo-400' : 'text-gray-400'}`} />
              <span className="text-xs mt-1 font-medium text-gray-400">Home</span>
            </Link>
            <Link href="/lessons" className="flex flex-col items-center justify-center w-full h-full">
              <BookOpen className={`h-6 w-6 ${pathname.startsWith('/lessons') ? 'text-indigo-400' : 'text-gray-400'}`} />
              <span className="text-xs mt-1 font-medium text-gray-400">Lessons</span>
            </Link>
            <Link href="/goals" className="flex flex-col items-center justify-center w-full h-full">
              <Trophy className={`h-6 w-6 ${pathname === '/goals' ? 'text-indigo-400' : 'text-gray-400'}`} />
              <span className="text-xs mt-1 font-medium text-gray-400">Goals</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full">
              <div className={`h-7 w-7 rounded-full ${pathname === '/profile' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-700'} flex items-center justify-center text-white`}>
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1 font-medium text-gray-400">Me</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 