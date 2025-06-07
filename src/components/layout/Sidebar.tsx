'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  BarChart3, 
  Users, 
  CreditCard,
  ChevronDown,
  Truck,
  LineChart,
  X,
  Menu as MenuIcon,
  LogIn,
  UserPlus,
  UserCheck,
  LogOut,
  Home,
  Layers,
  QrCode
} from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { logoutAndRedirect } from '@/utils/auth-helpers';

// Define types for navigation items
interface SubItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isParent: boolean;
  subItems?: SubItem[];
}

// Define sidebar navigation items
const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Profiles",
    href: "/profiles",
    icon: <Users className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Daybook",
    href: "/daybook",
    icon: <FileText className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Shortcuts",
    href: "/shortcuts",
    icon: <MenuIcon className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />,
    isParent: false,
  },
  
  {
    label: "Supply Chain",
    href: "/supply-chain",
    icon: <Truck className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: <FileText className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: <Users className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Financial",
    href: "/financial",
    icon: <BarChart3 className="h-5 w-5" />,
    isParent: true,
    subItems: [
      {
        label: "Dashboard",
        href: "/financial-dashboard",
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        label: "Balance Sheets",
        href: "/financial/balance-sheets",
        icon: <CreditCard className="h-4 w-4" />,
      }
    ]
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <LineChart className="h-5 w-5" />,
    isParent: false,
  },
];

// Public navigation items for logged out users
const publicNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Features",
    href: "/#modules",
    icon: <Layers className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Pricing",
    href: "/#pricing",
    icon: <CreditCard className="h-5 w-5" />,
    isParent: false,
  },
  {
    label: "Testimonials",
    href: "/#testimonials",
    icon: <Users className="h-5 w-5" />,
    isParent: false,
  },
];

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const isGuest = user?.publicMetadata.role === 'guest';

  const handleParentClick = (label: string) => {
    setActiveParent(prev => prev === label ? null : label);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleGuestLogin = () => {
    router.push('/auth/login?guest=true');
  };

  const handleSignOut = () => {
    logoutAndRedirect('/');
  };

  // Determine which nav items to display
  const displayNavItems = isSignedIn ? navItems : publicNavItems;

  return (
    <div className={cn(
      "h-full flex flex-col border-r bg-white shadow-md dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300",
      isMobile ? "" : "translate-x-0"
    )}>
      <div className="flex h-16 items-center border-b px-4 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="h-8 w-8 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-lg">S</span>
          <span className="text-gray-900 dark:text-white text-lg transition-colors duration-300">StockSage</span>
        </Link>
        {isMobile && (
          <button
            type="button"
            className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X size={20} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <nav className="grid gap-1 px-2">
          {displayNavItems.map((item, index) => (
            <div key={index}>
              {item.isParent ? (
                <div className="relative">
                  <button
                    onClick={() => handleParentClick(item.label)}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors duration-200",
                      activeParent === item.label
                        ? "bg-gray-100 font-medium dark:bg-gray-800"
                        : "",
                      pathname?.includes(item.href as string) &&
                        activeParent !== item.label &&
                        "bg-gray-50 dark:bg-gray-800/50"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform duration-200",
                        activeParent === item.label ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  
                  <div 
                    className={cn(
                      "mt-1 overflow-hidden transition-all duration-300 ease-in-out",
                      activeParent === item.label 
                        ? "max-h-96 opacity-100" 
                        : "max-h-0 opacity-0"
                    )}
                  >
                    {item.subItems && (
                      <ul className="space-y-1 px-6">
                        {item.subItems.map((subItem: SubItem, j: number) => (
                          <li key={j}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                                isActive(subItem.href)
                                  ? "bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
                                  : ""
                              )}
                              onClick={() => isMobile && onClose?.()}
                            >
                              {subItem.icon}
                              <span className="ml-3">{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                    isActive(item.href)
                      ? "bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
                      : ""
                  )}
                  onClick={() => isMobile && onClose?.()}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  {isActive(item.href) && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Footer */}
      <div className="mt-auto p-4 border-t dark:border-gray-800 transition-colors duration-300">
        {isSignedIn ? (
          <div className="flex flex-col space-y-2">
            {isGuest && (
              <Link
                href="/auth/login"
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <UserCheck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="ml-3">Switch Account</span>
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSignIn}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LogIn className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Sign In</span>
            </button>
            <button
              onClick={handleGuestLogin}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <UserPlus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3">Guest Access</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 