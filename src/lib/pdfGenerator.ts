import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { jsPDF as jsPDFType } from 'jspdf';

// Define our own simplified types for Invoice and InvoiceItem
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productSku?: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string | Date;
  dueDate: string | Date;
  vendorName: string;
  vendorAddress: string;
  vendorEmail?: string | null;
  vendorPhone?: string | null;
  customerName: string;
  customerAddress?: string | null;
  totalAmount: number;
  taxAmount?: number | null;
  paymentTerms?: string | null;
  notes?: string | null;
  paymentStatus?: string | null;
  stripeInvoiceId?: string | null;
  stripeCustomerId?: string | null;
  pdfUrl?: string | null;
  items: InvoiceItem[];
}

// Add TypeScript declaration for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface GenerateInvoicePDFOptions {
  invoice: Invoice;
  companyLogo?: string; // base64 encoded logo
  primaryColor?: string; // hex color code
  customTemplate?: 'default' | 'modern' | 'minimal';
  includeQRCode?: boolean;
  qrCodeData?: string;
  additionalNotes?: string;
}

export const generateInvoicePDF = async ({
  invoice,
  companyLogo,
  primaryColor = '#3B82F6',
  customTemplate = 'default',
  includeQRCode = false,
  qrCodeData,
  additionalNotes,
}: GenerateInvoicePDFOptions): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Default styles
  const textColor = '#333333';
  const accentColor = primaryColor;
  const fontSizeHeading = 20;
  const fontSizeSubHeading = 14;
  const fontSizeNormal = 10;
  const fontSizeSmall = 8;
  
  // Apply specific template settings
  switch (customTemplate) {
    case 'modern':
      // Modern template settings
      doc.setDrawColor(accentColor);
      doc.setFillColor(accentColor);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(fontSizeHeading);
      doc.text('INVOICE', 105, 15, { align: 'center' });
      doc.setTextColor(textColor);
      break;
      
    case 'minimal':
      // Minimal template settings
      doc.setDrawColor(accentColor);
      doc.line(14, 25, 196, 25);
      doc.setFontSize(fontSizeHeading);
      doc.setTextColor(accentColor);
      doc.text('INVOICE', 14, 20);
      doc.setTextColor(textColor);
      break;
      
    default:
      // Default template
      doc.setFontSize(fontSizeHeading);
      doc.setTextColor(accentColor);
      doc.text('INVOICE', 14, 20);
      doc.setTextColor(textColor);
      doc.setDrawColor(accentColor);
      doc.setLineWidth(0.5);
      doc.line(14, 25, 196, 25);
  }
  
  // Add company logo if provided
  if (companyLogo) {
    if (customTemplate === 'modern') {
      doc.addImage(companyLogo, 'JPEG', 14, 7, 20, 15);
    } else {
      doc.addImage(companyLogo, 'JPEG', 150, 10, 30, 20);
    }
  }
  
  // Starting position for content
  let y = customTemplate === 'modern' ? 35 : 35;
  
  // Invoice details
  doc.setFontSize(fontSizeNormal);
  doc.setTextColor(textColor);
  
  // Vendor info (left side)
  doc.setFontSize(fontSizeSubHeading);
  doc.text('From:', 14, y);
  y += 7;
  doc.setFontSize(fontSizeNormal);
  doc.text(invoice.vendorName, 14, y);
  y += 5;
  if (invoice.vendorAddress) {
    const addressLines = invoice.vendorAddress.split(',');
    for (const line of addressLines) {
      doc.text(line.trim(), 14, y);
      y += 5;
    }
  }
  if (invoice.vendorEmail) {
    doc.text(invoice.vendorEmail, 14, y);
    y += 5;
  }
  if (invoice.vendorPhone) {
    doc.text(invoice.vendorPhone, 14, y);
    y += 5;
  }
  
  // Reset Y position for customer info
  y = customTemplate === 'modern' ? 35 : 35;
  
  // Customer info (right side)
  doc.setFontSize(fontSizeSubHeading);
  doc.text('Bill To:', 120, y);
  y += 7;
  doc.setFontSize(fontSizeNormal);
  doc.text(invoice.customerName, 120, y);
  y += 5;
  if (invoice.customerAddress) {
    const addressLines = invoice.customerAddress.split(',');
    for (const line of addressLines) {
      doc.text(line.trim(), 120, y);
      y += 5;
    }
  }
  
  // Invoice metadata
  y = Math.max(y, 80); // Ensure we're below both address blocks
  
  doc.setFontSize(fontSizeSubHeading);
  doc.setTextColor(accentColor);
  doc.text('Invoice Details', 14, y);
  doc.setTextColor(textColor);
  y += 7;
  
  doc.setFontSize(fontSizeNormal);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, y);
  y += 5;
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 14, y);
  y += 5;
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, y);
  y += 5;
  if (invoice.paymentTerms) {
    doc.text(`Payment Terms: ${invoice.paymentTerms}`, 14, y);
    y += 5;
  }
  
  // Status badge (if applicable)
  if (invoice.paymentStatus) {
    y += 5;
    let statusColor = '#333333';
    switch (invoice.paymentStatus) {
      case 'PAID':
        statusColor = '#10B981'; // Green
        break;
      case 'PENDING':
        statusColor = '#F59E0B'; // Amber
        break;
      case 'FAILED':
      case 'CANCELLED':
        statusColor = '#EF4444'; // Red
        break;
    }
    
    doc.setFillColor(statusColor);
    doc.roundedRect(14, y - 4, 25, 7, 2, 2, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(fontSizeSmall);
    doc.text(invoice.paymentStatus, 26.5, y, { align: 'center' });
    doc.setTextColor(textColor);
    doc.setFontSize(fontSizeNormal);
    y += 10;
  } else {
    y += 5;
  }
  
  // Item table
  y += 5;
  const tableHeaders = [['Item', 'Quantity', 'Unit Price', 'Amount']];
  const tableData = invoice.items.map((item: InvoiceItem) => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.amount.toFixed(2)}`
  ]);
  
  doc.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: y,
    theme: 'grid',
    headStyles: {
      fillColor: accentColor,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
    },
    styles: {
      fontSize: fontSizeNormal,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });
  
  // Get the final Y position after the table
  y = (doc as any).lastAutoTable.finalY + 10;
  
  // Total section
  doc.setFontSize(fontSizeNormal);
  
  if (invoice.taxAmount && invoice.taxAmount > 0) {
    doc.text('Subtotal:', 150, y, { align: 'right' });
    doc.text(`$${(invoice.totalAmount - invoice.taxAmount).toFixed(2)}`, 190, y, { align: 'right' });
    y += 6;
    
    doc.text('Tax:', 150, y, { align: 'right' });
    doc.text(`$${invoice.taxAmount.toFixed(2)}`, 190, y, { align: 'right' });
    y += 6;
  }
  
  // Total amount
  doc.setFontSize(fontSizeSubHeading);
  doc.setTextColor(accentColor);
  doc.text('Total:', 150, y, { align: 'right' });
  doc.text(`$${invoice.totalAmount.toFixed(2)}`, 190, y, { align: 'right' });
  doc.setTextColor(textColor);
  y += 10;
  
  // Add a line before notes
  doc.setDrawColor('#CCCCCC');
  doc.line(14, y, 196, y);
  y += 10;
  
  // Notes section
  if (invoice.notes || additionalNotes) {
    doc.setFontSize(fontSizeSubHeading);
    doc.text('Notes:', 14, y);
    y += 7;
    doc.setFontSize(fontSizeNormal);
    
    if (invoice.notes) {
      const noteLines = doc.splitTextToSize(invoice.notes, 180);
      doc.text(noteLines, 14, y);
      y += noteLines.length * 5 + 5;
    }
    
    if (additionalNotes) {
      const additionalLines = doc.splitTextToSize(additionalNotes, 180);
      doc.text(additionalLines, 14, y);
      y += additionalLines.length * 5 + 5;
    }
  }
  
  // Add QR code if requested
  if (includeQRCode && qrCodeData) {
    // Simple QR code placeholder (in a real app, you'd use a QR code generator)
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(14, y, 30, 30, 2, 2, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(fontSizeSmall);
    doc.text('QR Code', 29, y + 15, { align: 'center' });
    doc.setTextColor(textColor);
    
    doc.setFontSize(fontSizeSmall);
    doc.text('Scan to pay or view', 14, y + 35);
  }
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(fontSizeSmall);
  doc.setTextColor('#666666');
  doc.text(
    `Generated by StockSage | Page ${pageCount}`,
    105,
    287,
    { align: 'center' }
  );
  
  // Return the PDF as a blob
  return doc.output('blob');
};

// Function to generate a custom template for an invoice
export const generateCustomInvoiceTemplate = async (
  invoice: Invoice,
  options?: Partial<GenerateInvoicePDFOptions>
): Promise<{ pdfBlob: Blob; pdfUrl: string }> => {
  // Generate the PDF
  const pdfBlob = await generateInvoicePDF({
    invoice,
    ...options,
  });
  
  // Convert blob to base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        pdfBlob,
        pdfUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(pdfBlob);
  });
}; 