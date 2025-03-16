'use client';

import React from 'react';
import { 
  Boxes, 
  BarChart3, 
  FileText, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Truck, 
  FileSpreadsheet, 
  CreditCard,
  PieChart,
  Zap
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface ModuleCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  path: string;
  comingSoon?: boolean;
}

export default function SystemOverview() {
  const router = useRouter();
  
  const modules: ModuleCard[] = [
    {
      title: "Inventory Management",
      description: "Track your products, materials, and finished goods with automated low-stock alerts",
      icon: <Boxes className="h-8 w-8 text-blue-500" />,
      active: true,
      path: "/inventory"
    },
    {
      title: "Financial Dashboard",
      description: "Get real-time insights into your financial health with profit margins and expense tracking",
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      active: true,
      path: "/financial"
    },
    {
      title: "Invoice Generation",
      description: "Create professional GST-compliant invoices with customizable templates",
      icon: <FileText className="h-8 w-8 text-purple-500" />,
      active: true,
      path: "/invoices"
    },
    {
      title: "AI-Powered Forecasting",
      description: "Predict demand patterns using historical data and market trends",
      icon: <TrendingUp className="h-8 w-8 text-orange-500" />,
      active: false,
      path: "/forecasting",
      comingSoon: true
    },
    {
      title: "Employee Management",
      description: "Track employee productivity, quality metrics, and compensation in one place",
      icon: <Users className="h-8 w-8 text-yellow-500" />,
      active: false,
      path: "/employees",
      comingSoon: true
    },
    {
      title: "Procurement Portal",
      description: "Manage suppliers, compare prices, and place orders automatically",
      icon: <Truck className="h-8 w-8 text-indigo-500" />,
      active: false,
      path: "/procurement",
      comingSoon: true
    },
    {
      title: "GST Compliance",
      description: "Automated filing with region-specific tax rules for businesses",
      icon: <FileSpreadsheet className="h-8 w-8 text-red-500" />,
      active: false,
      path: "/compliance",
      comingSoon: true
    },
    {
      title: "E-commerce Integration",
      description: "Connect with popular marketplaces to sell your products online",
      icon: <ShoppingBag className="h-8 w-8 text-pink-500" />,
      active: false,
      path: "/ecommerce",
      comingSoon: true
    },
    {
      title: "Payment Collection",
      description: "Integrated UPI, net banking and reminder systems for outstanding invoices",
      icon: <CreditCard className="h-8 w-8 text-cyan-500" />,
      active: false,
      path: "/payments",
      comingSoon: true
    }
  ];

  const activatedModules = modules.filter(m => m.active).length;
  const totalModules = modules.length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">StockSage System</h2>
          <p className="text-muted-foreground">
            Your all-in-one business management solution
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm">{activatedModules} Active Modules</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <span className="text-sm">{totalModules - activatedModules} Available for Upgrade</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <Card key={index} className={`p-6 relative overflow-hidden transition-all duration-300 ${!module.active && 'opacity-75 hover:opacity-90'}`}>
            {module.comingSoon && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs py-1 px-2 rounded">
                Coming Soon
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${!module.active ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                {module.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{module.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{module.description}</p>
                {module.active ? (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => router.push(module.path)}
                    className="w-full"
                  >
                    Access Module
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => alert('Upgrade your plan to access this feature')}
                  >
                    <Zap className="mr-1 h-4 w-4" />
                    Upgrade to Access
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div>
            <PieChart className="h-12 w-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Pay-as-you-grow Pricing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              StockSage grows with your business. Only pay for the modules you need, when you need them.
              Unlock advanced features as your business scales, with no upfront costs.
            </p>
          </div>
          <div>
            <Button variant="primary">View Pricing Plans</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 