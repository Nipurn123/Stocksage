import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/ThemeProvider';
import ClerkErrorProvider from '@/providers/ClerkErrorProvider';
import NextAuthProvider from '@/lib/auth/Provider';
import HydrationManager from '@/components/HydrationManager';
import Script from 'next/script';

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

// Hydration fix script
const hydrationScript = `
(function() {
  // This script runs before hydration
  document.documentElement.setAttribute('data-hydrating', 'true');
  
  // Listen for hydration completion
  window.addEventListener('load', function() {
    // Delay slightly to ensure React is fully hydrated
    setTimeout(function() {
      document.documentElement.removeAttribute('data-hydrating');
    }, 100);
  });
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Clerk env vars are invalid during static generation, provide minimal layout
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldUseMinimalLayout = isProduction && !hasValidEnv();
  
  if (shouldUseMinimalLayout) {
    return (
      <html lang="en" className={`${inter.variable} h-full`}>
        <body className="h-full bg-gray-50 dark:bg-black dark:text-white">
          <Script id="hydration-fix" strategy="beforeInteractive">{hydrationScript}</Script>
          <ThemeProvider>
            <NextAuthProvider>
              {children}
            </NextAuthProvider>
            <Toaster position="top-right" />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-gray-50 dark:bg-black dark:text-white">
        <Script id="hydration-fix" strategy="beforeInteractive">{hydrationScript}</Script>
        <ThemeProvider>
          <ClerkProvider 
            publishableKey={publishableKey}
            appearance={{
              elements: {
                footer: 'hidden'
              }
            }}
          >
            <ClerkErrorProvider>
              <NextAuthProvider>
                <HydrationManager />
                {children}
              </NextAuthProvider>
            </ClerkErrorProvider>
            <Toaster position="top-right" />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
