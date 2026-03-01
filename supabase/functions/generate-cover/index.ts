import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { issueId } = await req.json();

    if (!issueId) {
      return new Response(JSON.stringify({ error: "Missing issueId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    // Get issue with zine name
    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .select("id, zine_id, issue_number, month, zines(name)")
      .eq("id", issueId)
      .single();

    if (issueError || !issue) {
      console.error("Issue fetch error:", issueError);
      return new Response(JSON.stringify({ error: "Issue not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const zines = issue.zines as { name: string } | { name: string }[] | null;
    const zineName = Array.isArray(zines) ? zines[0]?.name : zines?.name || "Untitled";

    // Get all pages with their content
    const { data: pages } = await supabase
      .from("pages")
      .select("content")
      .eq("issue_id", issueId);

    // Extract text content from all pages
    const textContent: string[] = [];
    for (const page of pages || []) {
      const content = page.content as { blocks?: Array<{ type: string; content?: string }> };
      if (content?.blocks) {
        for (const block of content.blocks) {
          if (block.type === "text" && block.content) {
            textContent.push(block.content);
          }
        }
      }
    }

    const contentSummary = textContent.join(" ").slice(0, 2000) || "A creative collaborative zine among friends";

    console.log(`Generating cover for issue ${issueId}, zine: ${zineName}`);

    // Step 1: Use GPT to create an image prompt
    const promptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You create image generation prompts for magazine covers. Output ONLY the prompt, nothing else. 
Keep it under 200 words. Focus on mood, colors, abstract imagery. 
Never include text/words/letters in the image description - the title will be overlaid separately.
Style: modern indie zine, editorial, artistic, clean composition with space at top for title.`,
        },
        {
          role: "user",
          content: `Create an image prompt for a magazine cover. 
Magazine name: "${zineName}"
Content themes from this issue: ${contentSummary}`,
        },
      ],
      max_tokens: 300,
    });

    const imagePrompt =
      promptResponse.choices[0]?.message?.content ||
      "Abstract artistic magazine cover, modern editorial design, warm colors, clean composition with negative space at top, indie zine aesthetic";

    console.log("Generated prompt:", imagePrompt);

    // Step 2: Generate image with DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1792", // Portrait for magazine cover
      quality: "standard",
    });

    const generatedImageUrl = imageResponse.data?.[0]?.url;

    if (!generatedImageUrl) {
      console.error("No image URL returned from DALL-E");
      return new Response(JSON.stringify({ error: "Failed to generate image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Image generated, uploading to storage...");

    // Step 3: Download and upload to Supabase storage
    const imageRes = await fetch(generatedImageUrl);
    const imageBuffer = await imageRes.arrayBuffer();

    const fileName = `covers/${issueId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("page-images")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload cover" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("page-images").getPublicUrl(fileName);
    const coverUrl = urlData.publicUrl;

    // Step 4: Update issue with cover URL
    const { error: updateError } = await supabase
      .from("issues")
      .update({ cover_url: coverUrl })
      .eq("id", issueId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to save cover URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Cover generated successfully: ${coverUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        coverUrl,
        prompt: imagePrompt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Generate cover error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate cover" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
