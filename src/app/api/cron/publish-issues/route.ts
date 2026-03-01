import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Vercel Cron calls this endpoint
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

        // Generate cover
        const coverUrl = await generateCover(issue.id, issue.zines, issue.issue_number);
        
        results.push({
          issueId: issue.id,
          zineId: issue.zine_id,
          status: 'published',
          coverUrl,
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

async function generateCover(
  issueId: string, 
  zines: { name: string } | { name: string }[] | null,
  issueNumber: number
): Promise<string | null> {
  try {
    const zineName = Array.isArray(zines) ? zines[0]?.name : zines?.name || 'Untitled';

    // Get page content
    const { data: pages } = await supabase
      .from('pages')
      .select('content')
      .eq('issue_id', issueId);

    const textContent: string[] = [];
    for (const page of pages || []) {
      const content = page.content as { blocks?: Array<{ type: string; content?: string }> };
      if (content?.blocks) {
        for (const block of content.blocks) {
          if (block.type === 'text' && block.content) {
            textContent.push(block.content);
          }
        }
      }
    }

    const contentSummary = textContent.join(' ').slice(0, 2000) || 'A creative collaborative zine among friends';

    // Generate prompt
    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You create image generation prompts for magazine covers. Output ONLY the prompt, nothing else. 
Keep it under 200 words. Focus on mood, colors, abstract imagery. 
Never include text/words/letters in the image description.
Style: modern indie zine, editorial, artistic, clean composition with space at top for title.`
        },
        {
          role: 'user',
          content: `Create an image prompt for a magazine cover. 
Magazine name: "${zineName}"
Content themes: ${contentSummary}`
        }
      ],
      max_tokens: 300,
    });

    const imagePrompt = promptResponse.choices[0]?.message?.content || 
      `Abstract artistic magazine cover, modern editorial design, warm colors, indie zine aesthetic`;

    // Generate image
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1792',
      quality: 'standard',
    });

    const generatedImageUrl = imageResponse.data?.[0]?.url;
    if (!generatedImageUrl) return null;

    // Upload to Supabase
    const imageRes = await fetch(generatedImageUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    
    const fileName = `covers/${issueId}.png`;
    
    await supabase.storage
      .from('page-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    const { data: urlData } = supabase.storage
      .from('page-images')
      .getPublicUrl(fileName);

    const coverUrl = urlData.publicUrl;

    // Update issue
    await supabase
      .from('issues')
      .update({ cover_url: coverUrl })
      .eq('id', issueId);

    return coverUrl;

  } catch (error) {
    console.error('Cover generation failed:', error);
    return null;
  }
}
