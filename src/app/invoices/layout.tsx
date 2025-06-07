'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  BarChart, 
  ScanLine,
  Pencil,
  DownloadCloud,
  Plus,
  FileSearch,
  FileCheck,
  CreditCard
} from 'lucide-react';

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Navigation function
  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Define navigation items
  const primaryNavItems = [
    { path: '/invoices', label: 'All Invoices', icon: <FileText className="h-5 w-5 mr-2" /> },
    { path: '/invoices/pending', label: 'Pending', icon: <Clock className="h-5 w-5 mr-2" /> },
    { path: '/invoices/paid', label: 'Paid', icon: <CheckCircle className="h-5 w-5 mr-2" /> },
    { path: '/invoices/overdue', label: 'Overdue', icon: <AlertTriangle className="h-5 w-5 mr-2" /> },
    { path: '/invoices/reports', label: 'Reports', icon: <BarChart className="h-5 w-5 mr-2" /> }
  ];

  const sourceNavItems = [
    { path: '/invoices/scan', label: 'Scanned', icon: <ScanLine className="h-5 w-5 mr-2" /> },
    { path: '/invoices/manual', label: 'Manual', icon: <Pencil className="h-5 w-5 mr-2" /> },
    { path: '/invoices/imported', label: 'Imported', icon: <DownloadCloud className="h-5 w-5 mr-2" /> }
  ];

  const utilityNavItems = [
    {
      label: "New Invoice",
      path: "/invoices/create",
      icon: <Plus className="h-4 w-4 mr-2" />,
    },
    {
      label: "GST Generator",
      path: "/invoices/generator",
      icon: <FileCheck className="h-4 w-4 mr-2" />,
    },
    {
      label: "Search",
      path: "/invoices/search",
      icon: <FileSearch className="h-4 w-4 mr-2" />,
    },
  ];

  const additionalItems = [
    {
      label: "Templates",
      path: "/invoices/templates",
      icon: <FileText className="h-4 w-4 mr-2" />,
    },
    {
      label: "Stripe",
      path: "/invoices/stripe",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
    },
    {
      label: "Balance Sheet",
      path: "/invoices/balance-sheet",
      icon: <BarChart className="h-4 w-4 mr-2" />,
    },
    {
      label: "Verify",
      path: "/invoices/verify",
      icon: <FileCheck className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="w-full">
      {/* Header with action buttons */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col mb-4 md:mb-0">
              <h1 className="text-2xl font-bold tracking-tight mb-1">Invoice Management</h1>
              <p className="text-gray-500 dark:text-gray-400">Create, track, and manage your invoices</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {utilityNavItems.map((item) => (
                <Button 
                  key={item.path}
                  variant={item.path === '/invoices/create' ? 'default' : 'outline'} 
                  size="sm" 
                  className={item.path === '/invoices/create' ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => navigateTo(item.path)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Primary navigation - visible on all devices */}
          <div className="mt-6 pb-0">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
                {primaryNavItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                      (item.path === '/invoices' && pathname === '/invoices') || 
                      (item.path !== '/invoices' && pathname.includes(item.path))
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(item.path);
                    }}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {item.label}
                    </div>
                  </a>
                ))}
                
                <div className="border-l border-gray-200 dark:border-gray-700 mx-2"></div>
                
                {sourceNavItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                      pathname.includes(item.path)
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(item.path);
                    }}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {item.label}
                    </div>
                  </a>
                ))}
                
                <div className="border-l border-gray-200 dark:border-gray-700 mx-2"></div>
                
                {additionalItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                      pathname.includes(item.path)
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(item.path);
                    }}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {item.label}
                    </div>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-full px-4 sm:px-6 md:px-8 py-6">
        {children}
      </div>
    </div>
  );
} 