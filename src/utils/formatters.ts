import { format, parseISO } from 'date-fns';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

// Format date with time
export const formatDateTime = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, 'MMM dd, yyyy h:mm a');
  } catch (error) {
    return dateString;
  }
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Format number with thousand separators
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Format phone number
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format invoice status
export const formatInvoiceStatus = (status: string): { label: string; color: string } => {
  switch (status) {
    case 'draft':
      return { label: 'Draft', color: 'bg-gray-200 text-gray-800' };
    case 'sent':
      return { label: 'Sent', color: 'bg-blue-200 text-blue-800' };
    case 'paid':
      return { label: 'Paid', color: 'bg-green-200 text-green-800' };
    case 'overdue':
      return { label: 'Overdue', color: 'bg-red-200 text-red-800' };
    case 'canceled':
      return { label: 'Canceled', color: 'bg-yellow-200 text-yellow-800' };
    default:
      return { label: status, color: 'bg-gray-200 text-gray-800' };
  }
}; 