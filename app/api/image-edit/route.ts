import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json();

    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Simple approach matching Replicate API reference
    const input = {
      prompt: prompt,
      image_input: Array.isArray(image) ? image : [image]
    };

    console.log('Processing with nano-banana...');
    
    const output = await replicate.run("google/nano-banana", { input });

    console.log('Output:', output);

    // Get the URL from FileOutput
    const outputUrl = (output as any).url();

    return NextResponse.json({ 
      success: true, 
      output: outputUrl,
      message: 'Image processed successfully'
    });

  } catch (error: any) {
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process image', 
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Image editing API endpoint is running',
    model: 'google/nano-banana',
    description: 'Google\'s latest image editing model in Gemini 2.5',
    expectedInput: {
      prompt: 'string - Description of desired changes',
      image_input: 'array - Array of image URLs or base64 strings'
    }
  });
}
