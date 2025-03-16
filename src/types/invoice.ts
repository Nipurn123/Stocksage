export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  invoiceId?: string;
  productSku?: string;
  syncedWith?: string;
  syncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  vendorName: string;
  vendorAddress: string;
  vendorEmail?: string;
  vendorPhone?: string;
  customerName: string;
  customerAddress: string;
  totalAmount: number;
  taxAmount?: number;
  items: InvoiceItem[];
  paymentTerms?: string;
  paymentMethod?: string;
  notes?: string;
  status?: 'paid' | 'pending' | 'overdue';
  confidenceScore?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Stripe related fields
  stripeInvoiceId?: string;
  stripeCustomerId?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  pdfUrl?: string | null;
  
  // Compliance fields
  isCompliant?: boolean;
  complianceNotes?: string;
}

export interface InvoiceAnalysisResult {
  success: boolean;
  data?: Invoice;
  error?: string;
  message?: string;
  confidence?: number;
  invoiceId?: string;  // Database ID after saving
  dbError?: string;    // Database error message if save fails
} 