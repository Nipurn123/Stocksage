'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Layers, 
  BarChart3, 
  FileText, 
  TruckIcon, 
  DollarSign, 
  Users, 
  Settings, 
  Zap,
  Shield,
  Clock,
  CloudCog
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const modules = [
    {
      title: "Inventory Management",
      icon: <Layers className="h-12 w-12 p-2 text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl" />,
      description: "Manage your products, track stock levels, and monitor inventory changes in real-time.",
      link: "/inventory",
      tags: ["Product Catalog", "Stock Tracking", "Reorder Alerts"],
      isPopular: true,
    },
    {
      title: "Financial Analytics",
      icon: <BarChart3 className="h-12 w-12 p-2 text-green-500 bg-green-100 dark:bg-green-900/30 rounded-xl" />,
      description: "Track revenue, analyze sales trends, and make data-driven financial decisions with AI-powered insights.",
      link: "/financial",
      tags: ["Dashboards", "Sales Analysis", "Profit Tracking"],
      isPopular: true,
    },
    {
      title: "Invoice Generator",
      icon: <FileText className="h-12 w-12 p-2 text-blue-500 bg-blue-100 dark:bg-blue-900/30 rounded-xl" />,
      description: "Create professional, GST-compliant invoices for your products with customizable templates.",
      link: "/invoice",
      tags: ["GST Ready", "Custom Templates", "E-Way Bill Support"],
      isNew: true,
    },
    {
      title: "Supply Chain Management",
      icon: <TruckIcon className="h-12 w-12 p-2 text-amber-500 bg-amber-100 dark:bg-amber-900/30 rounded-xl" />,
      description: "Optimize your supply chain with supplier management, order tracking, and logistics analytics.",
      link: "/supply-chain",
      tags: ["Supplier Ratings", "Order Tracking", "Delivery Analytics"],
      isNew: true,
    },
    {
      title: "Customer Management",
      icon: <Users className="h-12 w-12 p-2 text-purple-500 bg-purple-100 dark:bg-purple-900/30 rounded-xl" />,
      description: "Manage your customers, track orders, and build stronger relationships with personalized insights.",
      link: "/customers",
      tags: ["Order History", "Payment Tracking", "Communication"],
    },
    {
      title: "Payment Processing",
      icon: <DollarSign className="h-12 w-12 p-2 text-red-500 bg-red-100 dark:bg-red-900/30 rounded-xl" />,
      description: "Process payments, track receivables, and manage your cash flow with integrated banking services.",
      link: "/payments",
      tags: ["UPI Integration", "Bank Transfers", "Payment Reminders"],
    },
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations and predictive analytics to optimize your inventory, pricing, and operations."
    },
    {
      icon: <CloudCog className="h-6 w-6" />,
      title: "Cloud-Based Platform",
      description: "Access your business data from anywhere, on any device, with real-time synchronization and no maintenance headaches."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Compliant",
      description: "Built with industry-standard security practices and fully compliant with GST and other Indian regulatory requirements."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Pay-As-You-Go",
      description: "Flexible pricing model allows you to start with just the modules you need and expand as your business grows."
    }
  ];

  const testimonials = [
    {
      quote: "StockSage transformed how we manage our inventory. We've reduced stockouts by 78% and improved our cash flow significantly.",
      author: "Robert Chen",
      company: "Global Retail Solutions",
      avatar: "/avatars/avatar-1.jpg"
    },
    {
      quote: "The GST-compliant invoice generator alone is worth the investment. It saves us hours of work every week and ensures we're always tax compliant.",
      author: "Sarah Johnson",
      company: "Modern Merchants",
      avatar: "/avatars/avatar-2.jpg"
    },
    {
      quote: "As a growing small business, we needed an affordable system that could scale with us. StockSage's modular approach is perfect for our needs.",
      author: "Michael Rodriguez",
      company: "Innovative Distributors",
      avatar: "/avatars/avatar-3.jpg"
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-950/20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-3/5">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                <span className="block">Inventory Management</span>
                <span className="block text-indigo-600 dark:text-indigo-400">Simplified for Businesses</span>
              </h1>
              <p className="mt-4 max-w-lg text-lg text-gray-500 dark:text-gray-300">
                StockSage provides a complete ERP solution for businesses of all sizes, with powerful inventory management, 
                financial analytics, and AI-powered invoice processing.
              </p>

              {/* Authentication options */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login">
                  <Button variant="default" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-10 md:mt-0 md:w-2/5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-1">
                  <div className="flex space-x-1 mb-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-indigo-600 dark:bg-indigo-700 text-white">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">StockSage Dashboard</div>
                        <div className="text-xs opacity-75">Logged in as Admin</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div className="w-full h-3 mb-2 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="w-2/3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"></div>
                        <div className="h-16 bg-green-100 dark:bg-green-900/30 rounded-lg"></div>
                        <div className="h-16 bg-amber-100 dark:bg-amber-900/30 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Modules for Every Business Need</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start with what you need now and add more modules as your business grows.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <div 
                key={index} 
                className="relative bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden group"
              >
                {module.isNew && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                    NEW
                  </div>
                )}
                {module.isPopular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                    POPULAR
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-5">{module.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{module.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {module.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-3 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Solution</div>
                    {module.title === "Inventory Management" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded text-xs flex items-center justify-center text-indigo-700 dark:text-indigo-300">Product Catalog</div>
                        <div className="h-8 bg-green-100 dark:bg-green-900/40 rounded text-xs flex items-center justify-center text-green-700 dark:text-green-300">Stock Levels</div>
                      </div>
                    )}
                    {module.title === "Financial Analytics" && (
                      <div className="h-14 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded flex items-center justify-center">
                        <div className="w-3/4 h-6 flex items-end space-x-1">
                          <div className="w-1/6 h-2/3 bg-green-500 dark:bg-green-600 rounded-t"></div>
                          <div className="w-1/6 h-full bg-green-500 dark:bg-green-600 rounded-t"></div>
                          <div className="w-1/6 h-2/4 bg-green-500 dark:bg-green-600 rounded-t"></div>
                          <div className="w-1/6 h-3/4 bg-green-500 dark:bg-green-600 rounded-t"></div>
                          <div className="w-1/6 h-1/2 bg-green-500 dark:bg-green-600 rounded-t"></div>
                          <div className="w-1/6 h-3/5 bg-green-500 dark:bg-green-600 rounded-t"></div>
                        </div>
                      </div>
                    )}
                    {module.title === "Invoice Generator" && (
                      <div className="h-14 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                        <div className="h-3 w-3/4 bg-blue-200 dark:bg-blue-700 rounded mb-1"></div>
                        <div className="h-2 w-1/2 bg-blue-200 dark:bg-blue-700 rounded mb-1"></div>
                        <div className="h-2 w-2/3 bg-blue-200 dark:bg-blue-700 rounded"></div>
                      </div>
                    )}
                    {module.title === "Supply Chain Management" && (
                      <div className="flex justify-between items-center">
                        <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-700 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        </div>
                        <div className="flex-1 h-1 mx-1 border-t-2 border-dashed border-amber-300 dark:border-amber-700"></div>
                        <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-700 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        </div>
                        <div className="flex-1 h-1 mx-1 border-t-2 border-dashed border-amber-300 dark:border-amber-700"></div>
                        <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-700 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        </div>
                      </div>
                    )}
                    {module.title === "Customer Management" && (
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/40 flex items-center justify-center text-xs text-purple-700 dark:text-purple-300">RS</div>
                        <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/40 flex items-center justify-center text-xs text-purple-700 dark:text-purple-300">AP</div>
                        <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/40 flex items-center justify-center text-xs text-purple-700 dark:text-purple-300">NK</div>
                      </div>
                    )}
                    {module.title === "Payment Processing" && (
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-8 rounded bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <span className="text-xs text-red-600 dark:text-red-300">UPI</span>
                        </div>
                        <div className="h-8 rounded bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <span className="text-xs text-red-600 dark:text-red-300">Bank</span>
                        </div>
                        <div className="h-8 rounded bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <span className="text-xs text-red-600 dark:text-red-300">Cash</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link href={module.link}>
                    <Button variant="ghost" className="group-hover:translate-x-1 transition-transform flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                      Explore Features <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose StockSage?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Built for businesses that want to streamline operations and boost growth
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Businesses Worldwide</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what our customers have to say about StockSage
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-800 transition-all duration-300">
                <div className="mb-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 inline-block" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mr-4">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400"></div>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900">
        <div className="container px-4 mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Business?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join 500+ businesses who have already digitized their operations with StockSage. Get started with a free 14-day trial, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="default" size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 sm:py-6 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-indigo-700 sm:py-6 px-8 text-lg">
              Request Demo
            </Button>
          </div>
          <p className="mt-6 text-indigo-200 text-sm">
            No credit card required. Cancel anytime. 24/7 support.
          </p>
        </div>
      </section>
    </div>
  );
}
