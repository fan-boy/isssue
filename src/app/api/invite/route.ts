import { createClient } from '@/lib/supabase/server';
import { sendInviteEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, zineId } = await request.json();

    if (!email || !zineId) {
      return NextResponse.json({ error: 'Missing email or zineId' }, { status: 400 });
    }

    // Get inviter's profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Get zine name
    const { data: zine } = await supabase
      .from('zines')
      .select('name, owner_id')
      .eq('id', zineId)
      .single();

    if (!zine) {
      return NextResponse.json({ error: 'Zine not found' }, { status: 404 });
    }

    // Check if user is owner
    if (zine.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check if already a member
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('memberships')
        .select('id')
        .eq('zine_id', zineId)
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }

      // Add existing user directly as member
      await supabase
        .from('memberships')
        .insert({
          zine_id: zineId,
          user_id: existingUser.id,
          role: 'member'
        });

      // Create page in current draft issue
      const { data: draftIssue } = await supabase
        .from('issues')
        .select('id')
        .eq('zine_id', zineId)
        .eq('status', 'draft')
        .order('issue_number', { ascending: false })
        .limit(1)
        .single();

      if (draftIssue) {
        const { count } = await supabase
          .from('pages')
          .select('*', { count: 'exact', head: true })
          .eq('issue_id', draftIssue.id);

        await supabase
          .from('pages')
          .insert({
            issue_id: draftIssue.id,
            user_id: existingUser.id,
            page_number: (count || 0) + 1,
          });
      }

      // Try to send notification email (don't fail if it doesn't work)
      try {
        const headersList = await headers();
        const host = headersList.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const appUrl = `${protocol}://${host}`;

        await sendInviteEmail({
          to: email.toLowerCase(),
          inviterName: inviterProfile?.name || 'Someone',
          zineName: zine.name,
          appUrl,
        });
      } catch (emailError) {
        console.log('Email not sent (domain not verified):', emailError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Member added!',
        alreadyUser: true 
      });
    }

    // New user - check if already invited
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id')
      .eq('zine_id', zineId)
      .eq('email', email.toLowerCase())
      .eq('accepted', false)
      .single();

    if (existingInvite) {
      return NextResponse.json({ error: 'Already invited' }, { status: 400 });
    }

    // Create invite record
    const { error: inviteError } = await supabase
      .from('invites')
      .insert({
        zine_id: zineId,
        email: email.toLowerCase(),
        invited_by: user.id,
      });

    if (inviteError) {
      console.error('Failed to create invite:', inviteError);
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    // Try to send invite email (don't fail if it doesn't work)
    let emailSent = false;
    try {
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const appUrl = `${protocol}://${host}`;

      await sendInviteEmail({
        to: email.toLowerCase(),
        inviterName: inviterProfile?.name || 'Someone',
        zineName: zine.name,
        appUrl,
      });
      emailSent = true;
    } catch (emailError) {
      console.log('Email not sent (domain not verified):', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: emailSent 
        ? 'Invite sent!' 
        : 'Invite created! Share the link with them to join.',
      alreadyUser: false 
    });

  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
