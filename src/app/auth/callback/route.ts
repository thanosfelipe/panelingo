import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

      if (user) {
        // Check if user has a username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        // If no username is set, redirect to onboarding
        if (!profile?.username) {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
        }
      }
    }

    // If user has username or something went wrong, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  } catch (error) {
    // If there's an error, redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url));
  }
} 