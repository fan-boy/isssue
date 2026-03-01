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
      .select('id, zine_id, issue_number, month, zines(name)')
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
        // Don't await - let it run in the background
        triggerCoverGeneration(issue.id).catch((err) => {
          console.error(`Failed to trigger cover generation for ${issue.id}:`, err);
        });

        results.push({
          issueId: issue.id,
          zineId: issue.zine_id,
          status: 'published',
          coverGeneration: 'triggered',
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
