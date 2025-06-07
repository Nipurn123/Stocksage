import { NextResponse } from 'next/server';

/**
 * API endpoint to check system status for debugging
 */
export async function GET() {
  try {
    // Basic system information
    const systemInfo = {
      node: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    };
    
    // Environment check
    const envStatus = {
      hasClerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemInfo,
      envStatus
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error in debug endpoint',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 