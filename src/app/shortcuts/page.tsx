'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Plus, 
  LayoutDashboard, 
  FileText, 
  Package, 
  BarChart3, 
  Users, 
  Truck, 
  LineChart,
  ShoppingCart,
  Settings,
  Grid,
  Edit2,
  Trash2,
  X,
  Save
} from 'lucide-react';
import Link from 'next/link';

// Define shortcut types
type Shortcut = {
  id: string;
  title: string;
  icon: string;
  url: string;
  color: string;
};

// Predefined icons for selection
const ICONS = [
  { name: 'Dashboard', component: LayoutDashboard },
  { name: 'Document', component: FileText },
  { name: 'Package', component: Package },
  { name: 'Chart', component: BarChart3 },
  { name: 'Users', component: Users },
  { name: 'Truck', component: Truck },
  { name: 'LineChart', component: LineChart },
  { name: 'Cart', component: ShoppingCart },
  { name: 'Settings', component: Settings },
  { name: 'Grid', component: Grid }
];

// Predefined colors for selection
const COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Gray', value: 'bg-gray-500' }
];

// Mock initial shortcuts
const initialShortcuts: Shortcut[] = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'Dashboard',
    url: '/dashboard',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Inventory',
    icon: 'Package',
    url: '/inventory',
    color: 'bg-green-500'
  },
  {
    id: '3',
    title: 'Sales Reports',
    icon: 'Chart',
    url: '/reports',
    color: 'bg-purple-500'
  },
  {
    id: '4',
    title: 'Invoices',
    icon: 'Document',
    url: '/invoices',
    color: 'bg-yellow-500'
  },
  {
    id: '5',
    title: 'Customers',
    icon: 'Users',
    url: '/customers',
    color: 'bg-red-500'
  }
];

export default function ShortcutsPage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [newShortcut, setNewShortcut] = useState<Partial<Shortcut>>({
    title: '',
    icon: 'Dashboard',
    url: '',
    color: 'bg-blue-500'
  });
  
  // Load shortcuts from localStorage or use initial data
  useEffect(() => {
    const savedShortcuts = localStorage.getItem('shortcuts');
    if (savedShortcuts) {
      try {
        setShortcuts(JSON.parse(savedShortcuts));
      } catch (e) {
        console.error('Failed to parse saved shortcuts:', e);
        setShortcuts(initialShortcuts);
      }
    } else {
      setShortcuts(initialShortcuts);
    }
  }, []);
  
  // Save shortcuts to localStorage when they change
  useEffect(() => {
    if (shortcuts.length > 0) {
      localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    }
  }, [shortcuts]);
  
  // Add new shortcut
  const handleAddShortcut = () => {
    if (!newShortcut.title || !newShortcut.url) return;
    
    const shortcut: Shortcut = {
      id: Date.now().toString(),
      title: newShortcut.title || '',
      icon: newShortcut.icon || 'Dashboard',
      url: newShortcut.url || '',
      color: newShortcut.color || 'bg-blue-500'
    };
    
    setShortcuts([...shortcuts, shortcut]);
    setNewShortcut({
      title: '',
      icon: 'Dashboard',
      url: '',
      color: 'bg-blue-500'
    });
    setIsAddingNew(false);
  };
  
  // Update existing shortcut
  const handleUpdateShortcut = () => {
    if (!editingShortcut) return;
    
    setShortcuts(shortcuts.map(shortcut => 
      shortcut.id === editingShortcut.id ? editingShortcut : shortcut
    ));
    
    setEditingShortcut(null);
  };
  
  // Delete shortcut
  const handleDeleteShortcut = (id: string) => {
    setShortcuts(shortcuts.filter(shortcut => shortcut.id !== id));
    
    if (editingShortcut?.id === id) {
      setEditingShortcut(null);
    }
  };
  
  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icon = ICONS.find(i => i.name === iconName);
    return icon ? icon.component : LayoutDashboard;
  };
  
  return (
    <div className="container mx-auto py-4">
      <div className="max-w-5xl mx-auto">
        {/* Shortcut grid */}
        <div className="mb-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Shortcuts</h2>
              <Button
                onClick={() => setIsAddingNew(true)}
                variant="outline"
                size="sm"
                className="flex items-center"
                disabled={isAddingNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Shortcut
              </Button>
            </div>
            
            {shortcuts.length === 0 && !isAddingNew ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You don&apos;t have any shortcuts yet</p>
                <Button onClick={() => setIsAddingNew(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Shortcut
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {shortcuts.map((shortcut) => {
                  const IconComponent = getIconComponent(shortcut.icon);
                  
                  return (
                    <div key={shortcut.id} className="relative group">
                      <Link href={shortcut.url} className="block">
                        <Card className="p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-200">
                          <div className={`${shortcut.color} w-12 h-12 rounded-full flex items-center justify-center text-white mb-3`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <span className="font-medium truncate w-full">{shortcut.title}</span>
                        </Card>
                      </Link>
                      
                      {/* Edit and delete buttons (visible on hover) */}
                      <div className="absolute top-2 right-2 hidden group-hover:flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingShortcut(shortcut);
                          }}
                          className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          aria-label={`Edit ${shortcut.title}`}
                        >
                          <Edit2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteShortcut(shortcut.id);
                          }}
                          className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          aria-label={`Delete ${shortcut.title}`}
                        >
                          <Trash2 className="h-3 w-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Add new shortcut card (fixed at the end) */}
                {!isAddingNew && (
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                    aria-label="Add new shortcut"
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    <span className="text-sm">Add Shortcut</span>
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
        
        {/* Add new shortcut form */}
        {isAddingNew && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Shortcut</h2>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newShortcut.title}
                  onChange={(e) => setNewShortcut({...newShortcut, title: e.target.value})}
                  placeholder="Dashboard, Inventory, etc."
                />
              </div>
              
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  id="url"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={newShortcut.url}
                  onChange={(e) => setNewShortcut({...newShortcut, url: e.target.value})}
                  placeholder="/dashboard, /inventory, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICONS.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setNewShortcut({...newShortcut, icon: icon.name})}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          newShortcut.icon === icon.name 
                            ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500' 
                            : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        aria-label={`Select ${icon.name} icon`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setNewShortcut({...newShortcut, color: color.value})}
                      className={`h-8 rounded-md ${color.value} ${
                        newShortcut.color === color.value 
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' 
                          : ''
                      }`}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddShortcut}
                  disabled={!newShortcut.title || !newShortcut.url}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shortcut
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Edit shortcut form */}
        {editingShortcut && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Shortcut</h2>
              <button
                onClick={() => setEditingShortcut(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Close edit form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  id="edit-title"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingShortcut.title}
                  onChange={(e) => setEditingShortcut({...editingShortcut, title: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  id="edit-url"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingShortcut.url}
                  onChange={(e) => setEditingShortcut({...editingShortcut, url: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICONS.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setEditingShortcut({...editingShortcut, icon: icon.name})}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          editingShortcut.icon === icon.name 
                            ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500' 
                            : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        aria-label={`Select ${icon.name} icon`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setEditingShortcut({...editingShortcut, color: color.value})}
                      className={`h-8 rounded-md ${color.value} ${
                        editingShortcut.color === color.value 
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' 
                          : ''
                      }`}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="danger" 
                  onClick={() => handleDeleteShortcut(editingShortcut.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingShortcut(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateShortcut}
                    disabled={!editingShortcut.title || !editingShortcut.url}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Help section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">About Shortcuts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Shortcuts provide quick access to your most frequently used sections of StockSage. Create, customize, and organize your shortcuts to streamline your workflow.
          </p>
          <div className="flex flex-col md:flex-row items-start md:space-x-8 space-y-4 md:space-y-0">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tips:</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
                <li>Create shortcuts for your most visited pages</li>
                <li>Choose custom colors and icons for easy identification</li>
                <li>Add shortcuts to any page within StockSage</li>
                <li>Edit shortcuts by hovering over them</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Popular Shortcuts:</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
                <li>Dashboard</li>
                <li>Inventory Management</li>
                <li>Recent Invoices</li>
                <li>Financial Reports</li>
                <li>Customer Database</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 