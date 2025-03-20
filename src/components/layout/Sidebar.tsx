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
  Settings, 
  CreditCard,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Truck,
  LineChart,
  X,
  Menu,
  LogIn,
  UserPlus,
  UserCheck,
  LogOut,
  Home,
  Layers
} from 'lucide-react';
import Button from '../ui/Button';
import { useClerk, useAuth, useUser } from '@clerk/nextjs';
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
    label: "Financial Dashboard",
    href: "/financial-dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    isParent: false,
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
  onToggle?: () => void;
  isSidebarOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  isOpen?: boolean;
}

export default function Sidebar({ onToggle, isSidebarOpen, isMobile, onClose, isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const isAuthenticated = isSignedIn;
  const isGuest = user?.publicMetadata.role === 'guest';

  const handleParentClick = (label: string) => {
    setActiveParent(prev => prev === label ? null : label);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleSignIn = async () => {
    router.push('/auth/login');
  };

  const handleGuestLogin = async () => {
    router.push('/auth/login?guest=true');
  };

  const handleSignOut = () => {
    logoutAndRedirect('/');
  };

  // Determine which sidebar state to show
  const sidebarOpen = isMobile ? isOpen : isSidebarOpen;
  const displayNavItems = isAuthenticated ? navItems : publicNavItems;

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white shadow-md dark:bg-gray-900 dark:border-gray-800 transition-transform duration-300",
      isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
    )}>
      <div className="flex h-16 items-center border-b px-4 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="h-8 w-8 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-lg">S</span>
          <span className="text-gray-900 dark:text-white text-lg">StockSage</span>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-auto"
          >
            <X size={20} />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {displayNavItems.map((item, index) => (
            <div key={index}>
              {item.isParent ? (
                <div className="relative">
                  <button
                    onClick={() => handleParentClick(item.label)}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
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
                  
                  {activeParent === item.label && item.subItems && (
                    <ul className="mt-1 space-y-1 px-6 overflow-hidden transition-all duration-300 ease-in-out">
                      {item.subItems.map((subItem: SubItem, j: number) => (
                        <li key={j} className="transform transition-all duration-200 ease-in-out">
                          <Link
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                              pathname === subItem.href
                                ? "bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
                                : ""
                            )}
                            onClick={isMobile && onClose ? onClose : undefined}
                          >
                            {subItem.icon}
                            <span className="ml-3">{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                    isActive(item.href)
                      ? "bg-gray-100 font-medium text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
                      : ""
                  )}
                  onClick={isMobile && onClose ? onClose : undefined}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Auth Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {isAuthenticated ? (
          <div>
            {isGuest && (
              <div className="mb-3 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-2 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-400">
                  You are using guest mode. Some features may be limited.
                </p>
              </div>
            )}
            <div className="flex items-center mb-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${isGuest ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`}>
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-white">
                  {user?.firstName || 'User'}
                  {isGuest && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      Guest
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              fullWidth 
              onClick={handleSignOut}
              className="flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Link href="/auth/login" className="block">
              <Button 
                variant="default" 
                size="sm" 
                fullWidth 
                className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" className="block">
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth 
                className="flex items-center justify-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 