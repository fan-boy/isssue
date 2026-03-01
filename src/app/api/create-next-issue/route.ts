import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/create-next-issue
// Creates the next draft issue for a zine (used when previous issue was published but next wasn't created)
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  
  try {
    const { zineId } = await request.json();

    if (!zineId) {
      return NextResponse.json({ error: 'Missing zineId' }, { status: 400 });
    }

    // Get zine info
    const { data: zine, error: zineError } = await supabase
      .from('zines')
      .select('id, release_day')
      .eq('id', zineId)
      .single();

    if (zineError || !zine) {
      return NextResponse.json({ error: 'Zine not found' }, { status: 404 });
    }

    // Check if there's already a draft issue
    const { data: existingDraft } = await supabase
      .from('issues')
      .select('id')
      .eq('zine_id', zineId)
      .eq('status', 'draft')
      .limit(1)
      .single();

    if (existingDraft) {
      return NextResponse.json({ 
        message: 'Draft issue already exists', 
        issueId: existingDraft.id 
      });
    }

    // Get latest issue number
    const { data: latestIssue } = await supabase
      .from('issues')
      .select('issue_number')
      .eq('zine_id', zineId)
      .order('issue_number', { ascending: false })
      .limit(1)
      .single();

    const nextIssueNumber = (latestIssue?.issue_number || 0) + 1;

    // Calculate next release date
    const now = new Date();
    let releaseDate = new Date(now.getFullYear(), now.getMonth() + 1, zine.release_day);
    
    // If release date is too soon (< 7 days), push to next month
    const daysUntilRelease = (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilRelease < 7) {
      releaseDate = new Date(now.getFullYear(), now.getMonth() + 2, zine.release_day);
    }

    const editDeadline = new Date(releaseDate);
    editDeadline.setDate(editDeadline.getDate() - 1);

    const month = `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`;

    // Create the new issue
    const { data: newIssue, error: issueError } = await supabase
      .from('issues')
      .insert({
        zine_id: zineId,
        issue_number: nextIssueNumber,
        month,
        status: 'draft',
        edit_deadline: editDeadline.toISOString(),
        release_date: releaseDate.toISOString(),
      })
      .select()
      .single();

    if (issueError || !newIssue) {
      console.error('Failed to create issue:', issueError);
      return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
    }

    // Get all members of this zine
    const { data: members } = await supabase
      .from('memberships')
      .select('user_id')
      .eq('zine_id', zineId);

    if (members && members.length > 0) {
      // Create pages for all members
      await supabase.from('pages').insert(
        members.map((member, index) => ({
          issue_id: newIssue.id,
          user_id: member.user_id,
          page_number: index + 1,
          content: { blocks: [], background: { type: 'color', value: '#FFFFFF' } },
          status: 'draft',
        }))
      );
    }

    return NextResponse.json({
      success: true,
      issue: newIssue,
      pagesCreated: members?.length || 0,
    });

  } catch (error) {
    console.error('Create next issue error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create issue' },
      { status: 500 }
    );
  }
}
