import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Simple approach matching Replicate API reference for image generation
    const input = {
      prompt: prompt,
      output_format: "jpg"
    };

    console.log('Generating image with Gemini 2.5 Flash...');
    
    const output = await replicate.run("google/gemini-2.5-flash-image", { input });

    console.log('Output:', output);

    // Get the URL from FileOutput
    const outputUrl = (output as any).url();

    return NextResponse.json({ 
      success: true, 
      output: outputUrl,
      message: 'Image generated successfully'
    });

  } catch (error: any) {
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Image generation API endpoint is running',
    model: 'google/gemini-2.5-flash-image',
    description: 'Google\'s Gemini 2.5 Flash model for image generation',
    expectedInput: {
      prompt: 'string - Description of the image to generate',
      output_format: 'string - Output format (jpg, png, webp)'
    }
  });
}
