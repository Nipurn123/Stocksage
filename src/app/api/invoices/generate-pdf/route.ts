import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Invoice } from '@/types/invoice';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { invoice } = body;

    // Validate invoice data
    if (!invoice || !invoice.invoiceNumber) {
      return NextResponse.json(
        { error: 'Invalid invoice data' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBytes = await generateInvoicePDF(invoice);

    // Return PDF as binary
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Generates a PDF document from invoice data
 */
async function generateInvoicePDF(invoice: Invoice): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  
  // Load fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set up constants
  const margin = 50;
  const fontSize = 12;
  const lineHeight = 20;
  let currentY = height - margin;
  
  // Helper function for drawing text
  const drawText = (text: string, x: number, y: number, font = helveticaFont, size = fontSize) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
    });
  };

  // Draw logo and header
  drawText('INVOICE', margin, currentY, helveticaBoldFont, 28);
  currentY -= 50;
  
  // Draw invoice details
  drawText('Invoice Number:', margin, currentY, helveticaBoldFont);
  drawText(invoice.invoiceNumber, margin + 120, currentY);
  currentY -= lineHeight;
  
  drawText('Date:', margin, currentY, helveticaBoldFont);
  drawText(invoice.date, margin + 120, currentY);
  currentY -= lineHeight;
  
  drawText('Due Date:', margin, currentY, helveticaBoldFont);
  drawText(invoice.dueDate, margin + 120, currentY);
  currentY -= lineHeight * 2;
  
  // Draw vendor details
  drawText('From:', margin, currentY, helveticaBoldFont, 14);
  currentY -= lineHeight;
  drawText(invoice.vendorName, margin, currentY);
  currentY -= lineHeight;
  drawText(invoice.vendorAddress, margin, currentY);
  currentY -= lineHeight;
  if (invoice.vendorEmail) {
    drawText(`Email: ${invoice.vendorEmail}`, margin, currentY);
    currentY -= lineHeight;
  }
  if (invoice.vendorPhone) {
    drawText(`Phone: ${invoice.vendorPhone}`, margin, currentY);
    currentY -= lineHeight;
  }
  currentY -= lineHeight;
  
  // Draw customer details
  drawText('Bill To:', margin, currentY, helveticaBoldFont, 14);
  currentY -= lineHeight;
  drawText(invoice.customerName, margin, currentY);
  currentY -= lineHeight;
  drawText(invoice.customerAddress, margin, currentY);
  currentY -= lineHeight * 2;
  
  // Draw items table header
  page.drawRectangle({
    x: margin,
    y: currentY - lineHeight,
    width: width - margin * 2,
    height: lineHeight + 5,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  drawText('Description', margin + 10, currentY - 15, helveticaBoldFont);
  drawText('Qty', margin + 250, currentY - 15, helveticaBoldFont);
  drawText('Unit Price', margin + 300, currentY - 15, helveticaBoldFont);
  drawText('Amount', margin + 400, currentY - 15, helveticaBoldFont);
  
  currentY -= lineHeight + 10;
  
  // Draw items
  if (invoice.items && invoice.items.length > 0) {
    for (const item of invoice.items) {
      drawText(item.description, margin + 10, currentY);
      drawText(item.quantity.toString(), margin + 250, currentY);
      drawText(formatCurrency(item.unitPrice), margin + 300, currentY);
      drawText(formatCurrency(item.amount), margin + 400, currentY);
      
      currentY -= lineHeight;
      
      // Add a new page if necessary
      if (currentY < margin + 100) {
        page.drawLine({
          start: { x: margin, y: currentY + 5 },
          end: { x: width - margin, y: currentY + 5 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
        
        const newPage = pdfDoc.addPage([612, 792]);
        currentY = height - margin;
      }
    }
  }
  
  // Draw line
  page.drawLine({
    start: { x: margin, y: currentY + 5 },
    end: { x: width - margin, y: currentY + 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  currentY -= lineHeight;
  
  // Draw totals
  if (invoice.taxAmount) {
    drawText('Subtotal:', width - margin - 150, currentY, helveticaBoldFont);
    drawText(formatCurrency(invoice.totalAmount - invoice.taxAmount), width - margin - 50, currentY, helveticaFont, 12);
    currentY -= lineHeight;
    
    drawText('Tax:', width - margin - 150, currentY, helveticaBoldFont);
    drawText(formatCurrency(invoice.taxAmount), width - margin - 50, currentY, helveticaFont, 12);
    currentY -= lineHeight;
  }
  
  drawText('Total:', width - margin - 150, currentY, helveticaBoldFont, 14);
  drawText(formatCurrency(invoice.totalAmount), width - margin - 50, currentY, helveticaBoldFont, 14);
  currentY -= lineHeight * 2;
  
  // Draw payment terms if available
  if (invoice.paymentTerms) {
    drawText('Payment Terms:', margin, currentY, helveticaBoldFont);
    drawText(invoice.paymentTerms, margin + 120, currentY);
    currentY -= lineHeight;
  }
  
  // Draw notes if available
  if (invoice.notes) {
    drawText('Notes:', margin, currentY, helveticaBoldFont);
    currentY -= lineHeight;
    
    // Split notes into multiple lines if needed
    const words = invoice.notes.split(' ');
    let line = '';
    for (const word of words) {
      if ((line + word).length > 60) {
        drawText(line, margin, currentY);
        currentY -= lineHeight;
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    }
    
    if (line) {
      drawText(line, margin, currentY);
    }
  }
  
  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Formats a number as currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
} 