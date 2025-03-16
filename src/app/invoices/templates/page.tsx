'use client';

import React from 'react';
import { ArrowLeft, LayoutTemplate, Check, Star, Download, Eye, Pencil } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isDefault: boolean;
  isPremium: boolean;
}

export default function InvoiceTemplatesPage() {
  const templates: InvoiceTemplate[] = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Simple and professional business invoice template',
      thumbnail: '/placeholders/invoice-classic.jpg',
      isDefault: true,
      isPremium: false
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, modern design with color accents',
      thumbnail: '/placeholders/invoice-modern.jpg',
      isDefault: false,
      isPremium: false
    },
    {
      id: 'handloom',
      name: 'Handloom Heritage',
      description: 'Specially designed for textile and handloom businesses',
      thumbnail: '/placeholders/invoice-handloom.jpg',
      isDefault: false,
      isPremium: true
    },
    {
      id: 'gst',
      name: 'GST Compliant',
      description: 'Detailed template with all required GST fields and sections',
      thumbnail: '/placeholders/invoice-gst.jpg',
      isDefault: false,
      isPremium: true
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean and minimal design with essential information only',
      thumbnail: '/placeholders/invoice-minimal.jpg',
      isDefault: false,
      isPremium: false
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated design with elegant typography and layout',
      thumbnail: '/placeholders/invoice-elegant.jpg',
      isDefault: false,
      isPremium: true
    }
  ];

  const setDefaultTemplate = (id: string) => {
    // In a real app, this would update the user's default template preference
    alert(`Template "${id}" set as default`);
  };

  const previewTemplate = (id: string) => {
    // In a real app, this would show a preview of the template
    alert(`Previewing template "${id}"`);
  };

  const editTemplate = (id: string) => {
    // In a real app, this would open the template editor
    alert(`Editing template "${id}"`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Invoice Templates</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Choose and customize invoice templates for your textile business
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Create Custom Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col overflow-hidden">
            <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
              <img
                src={template.thumbnail}
                alt={`${template.name} template preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3E${template.name} Template%3C/text%3E%3C/svg%3E`;
                }}
              />
              {template.isPremium && (
                <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Premium
                </div>
              )}
              {template.isDefault && (
                <div className="absolute top-2 left-2 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Default
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-medium text-lg">{template.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
              <div className="mt-auto flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => previewTemplate(template.id)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => editTemplate(template.id)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                </div>
                {!template.isDefault && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-sm"
                    onClick={() => setDefaultTemplate(template.id)}
                  >
                    Set Default
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Getting Started with Templates Section */}
      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Getting Started with Templates</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              1
            </div>
            <h3 className="font-medium">Choose a Template</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select from our collection of professionally designed invoice templates
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              2
            </div>
            <h3 className="font-medium">Customize Your Template</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add your logo, change colors, and adjust layouts to match your brand
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              3
            </div>
            <h3 className="font-medium">Generate Invoices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use your template to generate professional invoices for your customers
            </p>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <Download className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="font-medium">Import Existing Templates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have custom templates? Import them to use with our system.
              </p>
            </div>
            <Button variant="outline" className="ml-auto">Import Template</Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 