'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui';
import { 
  BarChart4, 
  FileText, 
  Calculator, 
  LineChart,
  DollarSign
} from 'lucide-react';

const navItems = [
  { 
    name: 'Dashboard', 
    href: '/financial/dashboard', 
    icon: <BarChart4 className="w-4 h-4" />
  },
  { 
    name: 'Analysis', 
    href: '/financial/analysis', 
    icon: <LineChart className="w-4 h-4" />
  },
  { 
    name: 'Reports', 
    href: '/financial/reports', 
    icon: <FileText className="w-4 h-4" />
  },
  { 
    name: 'Budgeting', 
    href: '/financial/budgeting', 
    icon: <DollarSign className="w-4 h-4" />
  },
  { 
    name: 'Forecasting', 
    href: '/financial/forecasting', 
    icon: <Calculator className="w-4 h-4" />
  }
];

export default function FinancialNavigation() {
  const pathname = usePathname();
  
  return (
    <Card className="mb-6">
      <div className="p-2 flex gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="mr-2">{item.icon}</div>
              {item.name}
            </Link>
          );
        })}
      </div>
    </Card>
  );
} 