import { NextResponse } from 'next/server';

/**
 * API endpoint to check if Gemini API key is properly configured
 */
export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return NextResponse.json(
        { success: false, error: 'Missing Gemini API key' },
        { status: 500 }
      );
    }
    
    if (apiKey.trim() === 'ADD_YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
      console.error('Gemini API key is set to placeholder value');
      return NextResponse.json(
        { success: false, error: 'Gemini API key is set to placeholder value' },
        { status: 500 }
      );
    }
    
    // Basic format validation
    if (apiKey.length < 10) {
      console.error('Gemini API key appears to be invalid (too short)');
      return NextResponse.json(
        { success: false, error: 'Gemini API key appears to be invalid' },
        { status: 500 }
      );
    }
    
    console.log('Gemini API key appears to be properly configured');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking Gemini API configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check API configuration' 
      },
      { status: 500 }
    );
  }
} 