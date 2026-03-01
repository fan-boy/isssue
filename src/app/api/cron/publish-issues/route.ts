import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Vercel Cron calls this endpoint daily at 9 AM UTC
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const now = new Date().toISOString();

    // Find all draft issues where release_date has passed
    const { data: issuesToPublish, error: fetchError } = await supabase
      .from('issues')
      .select('id, zine_id, issue_number, month, zines(name, release_day)')
      .eq('status', 'draft')
      .lte('release_date', now);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
    }

    if (!issuesToPublish || issuesToPublish.length === 0) {
      return NextResponse.json({ message: 'No issues to publish', count: 0 });
    }

    const results = [];

    for (const issue of issuesToPublish) {
      try {
        // Update status to published
        await supabase
          .from('issues')
          .update({ status: 'published' })
          .eq('id', issue.id);

        // Fire off cover generation via Supabase Edge Function (fire-and-forget)
        triggerCoverGeneration(issue.id).catch((err) => {
          console.error(`Failed to trigger cover generation for ${issue.id}:`, err);
        });

        // Create the next issue for this zine
        const nextIssue = await createNextIssue(supabase, issue);

        results.push({
          issueId: issue.id,
          zineId: issue.zine_id,
          status: 'published',
          coverGeneration: 'triggered',
          nextIssueId: nextIssue?.id || null,
        });
      } catch (err) {
        console.error(`Failed to publish issue ${issue.id}:`, err);
        results.push({
          issueId: issue.id,
          zineId: issue.zine_id,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${issuesToPublish.length} issues`,
      results,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron failed' },
      { status: 500 }
    );
  }
}

interface PublishedIssue {
  id: string;
  zine_id: string;
  issue_number: number;
  month: string;
  zines: { name: string; release_day: number } | { name: string; release_day: number }[] | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createNextIssue(
  supabase: any,
  publishedIssue: PublishedIssue
) {
  try {
    const zines = publishedIssue.zines;
    const releaseDay = Array.isArray(zines) ? zines[0]?.release_day : zines?.release_day;
    
    if (!releaseDay) {
      console.error('No release_day found for zine');
      return null;
    }

    // Calculate next month's release date
    const now = new Date();
    let releaseDate = new Date(now.getFullYear(), now.getMonth() + 1, releaseDay);
    
    // If release date is in the past or too soon (< 7 days), push to next month
    const daysUntilRelease = (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilRelease < 7) {
      releaseDate = new Date(now.getFullYear(), now.getMonth() + 2, releaseDay);
    }

    const editDeadline = new Date(releaseDate);
    editDeadline.setDate(editDeadline.getDate() - 1);

    const nextIssueNumber = publishedIssue.issue_number + 1;
    const month = `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`;

    // Create the new issue
    const { data: newIssue, error: issueError } = await supabase
      .from('issues')
      .insert({
        zine_id: publishedIssue.zine_id,
        issue_number: nextIssueNumber,
        month,
        status: 'draft',
        edit_deadline: editDeadline.toISOString(),
        release_date: releaseDate.toISOString(),
      })
      .select()
      .single();

    if (issueError || !newIssue) {
      console.error('Failed to create next issue:', issueError);
      return null;
    }

    // Get all members of this zine
    const { data: members } = await supabase
      .from('memberships')
      .select('user_id')
      .eq('zine_id', publishedIssue.zine_id);

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

    console.log(`Created next issue ${nextIssueNumber} for zine ${publishedIssue.zine_id}`);
    return newIssue;
  } catch (error) {
    console.error('Error creating next issue:', error);
    return null;
  }
}

async function triggerCoverGeneration(issueId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Call the Supabase Edge Function
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-cover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ issueId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Edge function failed: ${response.status} ${text}`);
  }
}
