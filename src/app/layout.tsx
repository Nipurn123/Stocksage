import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/ThemeProvider';
import ClerkErrorProvider from '@/providers/ClerkErrorProvider';
import GlobalErrorHandler from '@/providers/GlobalErrorHandler';
import NextAuthProvider from '@/lib/auth/Provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Get environment variables with fallbacks
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_c2tpbGxlZC1sZW1taW5nLTIwLmNsZXJrLmFjY291bnRzLmRldiQ';

// Check if we have valid environment variables, particularly important for build time
const hasValidEnv = () => {
  try {
    return typeof publishableKey === 'string' && publishableKey.length > 10;
  } catch (e) {
    console.warn('Error checking environment variables:', e);
    return false;
  }
};

export const metadata: Metadata = {
  title: 'StockSage - Inventory and Invoice Management',
  description: 'Streamline your inventory management and invoicing with StockSage.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Clerk env vars are invalid during static generation, provide minimal layout
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldUseMinimalLayout = isProduction && !hasValidEnv();
  
  // Define common class for html element - avoid adding hydrated class that could cause mismatches
  const htmlClass = `${inter.variable} h-full transition-colors duration-300`;
  
  if (shouldUseMinimalLayout) {
    return (
      <html lang="en" className={htmlClass}>
        <body className="h-full bg-gray-50 dark:bg-black dark:text-white transition-colors duration-300">
          <ThemeProvider>
            <GlobalErrorHandler>
              <NextAuthProvider>
                {children}
              </NextAuthProvider>
            </GlobalErrorHandler>
            <Toaster position="top-right" />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={htmlClass}>
      <body className="h-full bg-gray-50 dark:bg-black dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <ClerkProvider 
            publishableKey={publishableKey}
            appearance={{
              elements: {
                footer: 'hidden'
              }
            }}
          >
            <GlobalErrorHandler>
              <ClerkErrorProvider>
                <NextAuthProvider>
                  {children}
                </NextAuthProvider>
              </ClerkErrorProvider>
            </GlobalErrorHandler>
            <Toaster position="top-right" />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
