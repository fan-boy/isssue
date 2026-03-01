import { NextRequest, NextResponse } from 'next/server';

// Proxy to Supabase Edge Function for cover generation
// This keeps the API consistent while offloading the long-running work
export async function POST(request: NextRequest) {
  try {
    const { issueId } = await request.json();

    if (!issueId) {
      return NextResponse.json({ error: 'Missing issueId' }, { status: 400 });
    }

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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Edge function failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Generate cover proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate cover' },
      { status: 500 }
    );
  }
}
