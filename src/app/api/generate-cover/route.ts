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

export async function POST(request: NextRequest) {
  try {
    const { issueId } = await request.json();

    if (!issueId) {
      return NextResponse.json({ error: 'Missing issueId' }, { status: 400 });
    }

    // Get issue with zine name
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('id, zine_id, issue_number, month, zines(name)')
      .eq('id', issueId)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const zines = issue.zines as { name: string } | { name: string }[] | null;
    const zineName = Array.isArray(zines) ? zines[0]?.name : zines?.name || 'Untitled';

    // Get all pages with their content
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('content')
      .eq('issue_id', issueId);

    if (pagesError) {
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }

    // Extract text content from all pages
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

    // Step 1: Use GPT to analyze content and create an image prompt
    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You create image generation prompts for magazine covers. Output ONLY the prompt, nothing else. 
Keep it under 200 words. Focus on mood, colors, abstract imagery. 
Never include text/words/letters in the image description - the title will be overlaid separately.
Style: modern indie zine, editorial, artistic, clean composition with space at top for title.`
        },
        {
          role: 'user',
          content: `Create an image prompt for a magazine cover. 
Magazine name: "${zineName}"
Content themes from this issue: ${contentSummary}`
        }
      ],
      max_tokens: 300,
    });

    const imagePrompt = promptResponse.choices[0]?.message?.content || 
      `Abstract artistic magazine cover, modern editorial design, warm colors, clean composition with negative space at top, indie zine aesthetic`;

    console.log('Generated prompt:', imagePrompt);

    // Step 2: Generate image with DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1792', // Portrait for magazine cover
      quality: 'standard',
    });

    const generatedImageUrl = imageResponse.data?.[0]?.url;

    if (!generatedImageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    // Step 3: Download and upload to Supabase storage
    const imageRes = await fetch(generatedImageUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    
    const fileName = `covers/${issueId}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('page-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload cover' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('page-images')
      .getPublicUrl(fileName);

    const coverUrl = urlData.publicUrl;

    // Step 4: Update issue with cover URL
    const { error: updateError } = await supabase
      .from('issues')
      .update({ cover_url: coverUrl })
      .eq('id', issueId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to save cover URL' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      coverUrl,
      prompt: imagePrompt 
    });

  } catch (error) {
    console.error('Generate cover error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate cover' },
      { status: 500 }
    );
  }
}
