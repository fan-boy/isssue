import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { SupabaseClient, User } from '@supabase/supabase-js';

async function handlePostAuth(supabase: SupabaseClient, user: User, origin: string, next: string) {
  // Check for pending invites for this user's email
  const { data: invites } = await supabase
    .from('invites')
    .select('id, zine_id')
    .eq('email', user.email?.toLowerCase())
    .eq('accepted', false);

  if (invites && invites.length > 0) {
    for (const invite of invites) {
      // Add user as member
      const { error: memberError } = await supabase
        .from('memberships')
        .insert({
          zine_id: invite.zine_id,
          user_id: user.id,
          role: 'member'
        });

      if (!memberError) {
        // Mark invite as accepted
        await supabase
          .from('invites')
          .update({ accepted: true })
          .eq('id', invite.id);

        // Create page for user in current draft issue
        const { data: draftIssue } = await supabase
          .from('issues')
          .select('id')
          .eq('zine_id', invite.zine_id)
          .eq('status', 'draft')
          .order('issue_number', { ascending: false })
          .limit(1)
          .single();

        if (draftIssue) {
          // Get next page number
          const { count } = await supabase
            .from('pages')
            .select('*', { count: 'exact', head: true })
            .eq('issue_id', draftIssue.id);

          await supabase
            .from('pages')
            .insert({
              issue_id: draftIssue.id,
              user_id: user.id,
              page_number: (count || 0) + 1,
            });
        }
      }
    }
  }

  // Check if user has completed their profile (has a name set)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  // If no name set, redirect to profile onboarding
  if (!profile?.name) {
    return NextResponse.redirect(`${origin}/profile?onboarding=true`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('Auth callback params:', { code: !!code, token_hash: !!token_hash, type, url: request.url });

  const supabase = await createClient();

  // Handle token_hash flow (email magic links)
  if (token_hash && type) {
    const { data: sessionData, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'magiclink' | 'email',
    });
    
    console.log('verifyOtp result:', { user: !!sessionData?.user, error: error?.message });
    
    if (!error && sessionData.user) {
      return handlePostAuth(supabase, sessionData.user, origin, next);
    }
    
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  // Handle code flow (PKCE)
  if (code) {
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('exchangeCode result:', { user: !!sessionData?.user, error: error?.message });
    
    if (!error && sessionData.user) {
      return handlePostAuth(supabase, sessionData.user, origin, next);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
