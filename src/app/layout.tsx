import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import NextAuthProvider from "@/lib/auth/Provider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StockSage - Inventory and Invoice Management",
  description: "Streamline your inventory management and invoicing with StockSage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-gray-50 dark:bg-black dark:text-white">
        <ThemeProvider>
          <NextAuthProvider>
            <Toaster position="top-right" />
            {children}
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
