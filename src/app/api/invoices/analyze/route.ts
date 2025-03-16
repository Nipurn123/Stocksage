import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Invoice, InvoiceAnalysisResult } from '@/types/invoice';
import { prisma } from '@/lib/prisma';

/**
 * Extracts structured invoice data from an image using Google's Gemini Vision API
 * @param imageBase64 - Base64 encoded image data
 * @returns Analysis result with structured invoice data
 */
async function analyzeInvoiceWithGemini(
  imageBase64: string
): Promise<InvoiceAnalysisResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Structured prompt to get consistent data format
    const prompt = `
      Analyze this invoice image and extract all information in a structured JSON format.
      Include the following fields:
      - invoiceNumber (string): The invoice's unique identifier
      - date (string in YYYY-MM-DD format): The issue date
      - dueDate (string in YYYY-MM-DD format): The due date
      - vendorName (string): The company issuing the invoice
      - vendorAddress (string): The complete address of the vendor
      - vendorEmail (string): The vendor's email address
      - vendorPhone (string): The vendor's phone number
      - customerName (string): The customer's name or company
      - customerAddress (string): The complete address of the customer
      - totalAmount (number): The total amount due
      - taxAmount (number): The tax amount
      - items (array of objects): Each containing:
        - description (string): Item description
        - quantity (number): Quantity purchased
        - unitPrice (number): Price per unit
        - amount (number): Total amount for this line item
      - paymentTerms (string): Payment terms 
      - notes (string): Any additional notes

      Format all currency values as plain numbers without currency symbols.
      If any field is missing from the invoice, include the key with null value.
      Respond ONLY with the JSON object, no additional text.
    `;

    // Call the Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            topP: 0.95,
            topK: 40,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    // Extract the text content from Gemini response
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('No text content found in Gemini API response');
    }
    
    // Find and parse the JSON object in the response
    let jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }
    
    // Parse the extracted JSON
    const invoiceData = JSON.parse(jsonMatch[0]) as Invoice;
    
    // Clean up any potentially missing fields
    const cleanedInvoice: Invoice = {
      invoiceNumber: invoiceData.invoiceNumber || 'UNKNOWN',
      date: invoiceData.date || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || new Date().toISOString().split('T')[0],
      vendorName: invoiceData.vendorName || 'Unknown Vendor',
      vendorAddress: invoiceData.vendorAddress || 'Unknown Address',
      vendorEmail: invoiceData.vendorEmail,
      vendorPhone: invoiceData.vendorPhone,
      customerName: invoiceData.customerName || 'Unknown Customer',
      customerAddress: invoiceData.customerAddress || 'Unknown Address',
      totalAmount: invoiceData.totalAmount || 0,
      taxAmount: invoiceData.taxAmount,
      items: Array.isArray(invoiceData.items) ? invoiceData.items.map(item => ({
        description: item.description || 'Unknown Item',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        amount: item.amount || 0,
      })) : [],
      paymentTerms: invoiceData.paymentTerms,
      notes: invoiceData.notes,
    };

    // Calculate confidence score based on how many fields were successfully extracted
    const totalFields = Object.keys(cleanedInvoice).length;
    const fieldsWithValues = Object.entries(cleanedInvoice).filter(([key, value]) => {
      if (key === 'items' && Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== '';
    }).length;
    
    const confidence = fieldsWithValues / totalFields;

    return {
      success: true,
      data: cleanedInvoice,
      confidence,
      message: 'Invoice analyzed successfully with Gemini Vision API',
    };
  } catch (error) {
    console.error('Error analyzing invoice with Gemini:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze invoice with Gemini Vision API',
    };
  }
}

/**
 * Saves the extracted invoice data to the database
 */
async function saveInvoiceToDatabase(invoice: Invoice, confidenceScore: number): Promise<string> {
  const { items, ...invoiceData } = invoice;
  
  // Create the invoice record with its items
  const savedInvoice = await prisma.invoice.create({
    data: {
      ...invoiceData,
      confidenceScore,
      items: {
        create: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return savedInvoice.id;
}

/**
 * Compresses a base64 image if it's too large
 * This is a simple implementation. In production, you might want to use a more sophisticated image processing library.
 */
function compressBase64Image(base64Image: string): string {
  // Only compress if the image is large (> 1MB)
  if (base64Image.length <= 1024 * 1024) return base64Image;
  
  // Simple compression: truncate the string and add an indicator
  // In a real implementation, you would use proper image compression
  const maxLength = 1024 * 1024; // 1MB
  return base64Image.substring(0, maxLength);
}

/**
 * The main handler for the POST endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate the file
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file is not an image' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert the image to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Call the Gemini Vision API with the image
    const result = await analyzeInvoiceWithGemini(base64Image);

    // If analysis was successful, save to database
    if (result.success && result.data) {
      try {
        const invoiceId = await saveInvoiceToDatabase(result.data, result.confidence || 0);
        result.invoiceId = invoiceId; // Add the database ID to the response
      } catch (dbError) {
        console.error('Error saving invoice to database:', dbError);
        // We still return the analysis result even if DB save fails
        result.dbError = 'Failed to save invoice to database';
      }
    }

    // Return the analysis result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process invoice',
      },
      { status: 500 }
    );
  }
} 