import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && sessionData.user) {
      // Check for pending invites for this user's email
      const { data: invites } = await supabase
        .from('invites')
        .select('id, zine_id')
        .eq('email', sessionData.user.email?.toLowerCase())
        .eq('accepted', false);

      if (invites && invites.length > 0) {
        for (const invite of invites) {
          // Add user as member
          const { error: memberError } = await supabase
            .from('memberships')
            .insert({
              zine_id: invite.zine_id,
              user_id: sessionData.user.id,
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
                  user_id: sessionData.user.id,
                  page_number: (count || 0) + 1,
                });
            }
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
