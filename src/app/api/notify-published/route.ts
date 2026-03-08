import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendIssuePublishedEmail } from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://isssue.ink';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { issueId, zineId } = await request.json();

    if (!issueId || !zineId) {
      return NextResponse.json({ error: 'Missing issueId or zineId' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get issue details
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('issue_number, zines(name)')
      .eq('id', issueId)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const zineName = Array.isArray(issue.zines) ? issue.zines[0]?.name : (issue.zines as { name: string })?.name;

    // Get all members with their profile info
    const { data: members, error: membersError } = await supabase
      .from('memberships')
      .select('user_id, profiles!inner(email, name)')
      .eq('zine_id', zineId);

    if (membersError || !members || members.length === 0) {
      return NextResponse.json({ message: 'No members to notify', count: 0 });
    }

    const issueUrl = `${APP_URL}/z/${zineId}/issue/${issueId}`;
    let sent = 0;
    let failed = 0;

    // Send emails in parallel
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      members.map(async (member: any) => {
        // profiles comes back as object with !inner join
        const profile = member.profiles;
        const email = profile?.email;
        const name = profile?.name;
        if (!email) return;

        try {
          await sendIssuePublishedEmail({
            to: email,
            memberName: name || 'there',
            zineName: zineName || 'your zine',
            issueNumber: issue.issue_number,
            issueUrl,
          });
          sent++;
        } catch (err) {
          console.error(`Failed to send notification to ${email}:`, err);
          failed++;
        }
      })
    );

    return NextResponse.json({ 
      message: `Notified ${sent} members`, 
      sent, 
      failed 
    });
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to notify' },
      { status: 500 }
    );
  }
}
