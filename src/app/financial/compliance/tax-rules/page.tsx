'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Plus, 
  Save,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Globe,
  Package, 
  Percent
} from 'lucide-react';

// Types
type TaxRateCategory = 'standard' | 'reduced' | 'zero' | 'exempt';

type TaxRule = {
  id: string;
  name: string;
  region: string;
  category: TaxRateCategory;
  rate: number;
  productTypes: string[];
  isDefault: boolean;
  description: string;
  lastUpdated: string;
};

// Mock data for tax rules
const mockTaxRules: TaxRule[] = [
  {
    id: 'tax-rule-1',
    name: 'US Sales Tax',
    region: 'United States',
    category: 'standard',
    rate: 7.5,
    productTypes: ['Electronics', 'Furniture', 'Office Supplies'],
    isDefault: true,
    description: 'Standard sales tax rate for US-based customers',
    lastUpdated: '2023-11-15',
  },
  {
    id: 'tax-rule-2',
    name: 'EU Standard VAT',
    region: 'European Union',
    category: 'standard',
    rate: 21,
    productTypes: ['All Products'],
    isDefault: false,
    description: 'Standard VAT rate for EU-based customers',
    lastUpdated: '2023-11-10',
  },
  {
    id: 'tax-rule-3',
    name: 'UK VAT',
    region: 'United Kingdom',
    category: 'standard',
    rate: 20,
    productTypes: ['Electronics', 'Software'],
    isDefault: false,
    description: 'Standard VAT rate for UK-based customers',
    lastUpdated: '2023-11-05',
  },
  {
    id: 'tax-rule-4',
    name: 'Canada GST/HST',
    region: 'Canada',
    category: 'standard',
    rate: 13,
    productTypes: ['All Products'],
    isDefault: false,
    description: 'GST/HST for Canadian customers',
    lastUpdated: '2023-10-25',
  },
  {
    id: 'tax-rule-5',
    name: 'Digital Products EU',
    region: 'European Union',
    category: 'reduced',
    rate: 10,
    productTypes: ['Digital Products', 'Software Subscriptions'],
    isDefault: false,
    description: 'Reduced rate for digital products in EU',
    lastUpdated: '2023-10-20',
  },
];

// Product type options for dropdown
const productTypeOptions = [
  'All Products',
  'Electronics',
  'Furniture',
  'Office Supplies',
  'Digital Products',
  'Software',
  'Software Subscriptions',
  'Books',
  'Food & Beverages',
  'Clothing',
  'Services',
];

// Region options for dropdown
const regionOptions = [
  'United States',
  'European Union',
  'United Kingdom',
  'Canada',
  'Australia',
  'Japan',
  'China',
  'India',
  'Brazil',
  'Global',
];

// Tax categories with descriptions
const taxCategories = [
  { 
    value: 'standard', 
    label: 'Standard Rate', 
    description: 'The default tax rate applied to most goods and services' 
  },
  { 
    value: 'reduced', 
    label: 'Reduced Rate', 
    description: 'A lower rate applied to specific categories like food, books, etc.' 
  },
  { 
    value: 'zero', 
    label: 'Zero Rate (0%)', 
    description: 'Taxable but charged at 0% - businesses can still reclaim input tax' 
  },
  { 
    value: 'exempt', 
    label: 'Tax Exempt', 
    description: 'Not subject to tax - businesses cannot reclaim input tax' 
  },
];

export default function TaxRulesPage() {
  const { user } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  
  const [taxRules, setTaxRules] = useState<TaxRule[]>(mockTaxRules);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  
  // New tax rule form state
  const defaultNewRule: Omit<TaxRule, 'id' | 'lastUpdated'> = {
    name: '',
    region: 'United States',
    category: 'standard',
    rate: 0,
    productTypes: [],
    isDefault: false,
    description: '',
  };
  
  const [newRule, setNewRule] = useState(defaultNewRule);
  
  // Filtered tax rules based on search term
  const filteredRules = taxRules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle adding a new tax rule
  const handleAddRule = () => {
    if (isGuest) {
      alert('In guest mode, changes are not saved. This is a demo feature.');
      return;
    }
    
    // Validate the form
    if (!newRule.name || !newRule.region || newRule.rate < 0) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Check if setting a new default rule
    if (newRule.isDefault) {
      // Find the current default rule and update it
      const updatedRules = taxRules.map(rule => 
        rule.isDefault ? { ...rule, isDefault: false } : rule
      );
      setTaxRules(updatedRules);
    }
    
    // Create a new tax rule
    const newTaxRule: TaxRule = {
      id: `tax-rule-${taxRules.length + 1}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      ...newRule,
    };
    
    // Add the new rule to the list
    setTaxRules([...taxRules, newTaxRule]);
    
    // Reset the form
    setNewRule(defaultNewRule);
    setIsAddingRule(false);
  };
  
  // Handle updating an existing tax rule
  const handleUpdateRule = () => {
    if (!editingRule) return;
    
    if (isGuest) {
      alert('In guest mode, changes are not saved. This is a demo feature.');
      return;
    }
    
    // Check if setting a new default rule
    if (editingRule.isDefault) {
      // Update all other rules to not be default
      setTaxRules(taxRules.map(rule => 
        rule.id !== editingRule.id ? { ...rule, isDefault: false } : rule
      ));
    }
    
    // Update the rule in the list
    setTaxRules(taxRules.map(rule => 
      rule.id === editingRule.id ? { ...editingRule, lastUpdated: new Date().toISOString().split('T')[0] } : rule
    ));
    
    // Reset editing state
    setEditingRule(null);
  };
  
  // Handle deleting a tax rule
  const handleDeleteRule = (id: string) => {
    if (isGuest) {
      alert('In guest mode, changes are not saved. This is a demo feature.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this tax rule? This action cannot be undone.')) {
      // Remove the rule from the list
      setTaxRules(taxRules.filter(rule => rule.id !== id));
    }
  };
  
  // Toggle product type selection
  const toggleProductType = (type: string) => {
    if (editingRule) {
      // For editing mode
      const updatedTypes = editingRule.productTypes.includes(type)
        ? editingRule.productTypes.filter(t => t !== type)
        : [...editingRule.productTypes, type];
      
      setEditingRule({ ...editingRule, productTypes: updatedTypes });
    } else {
      // For adding mode
      const updatedTypes = newRule.productTypes.includes(type)
        ? newRule.productTypes.filter(t => t !== type)
        : [...newRule.productTypes, type];
      
      setNewRule({ ...newRule, productTypes: updatedTypes });
    }
  };
  
  // Format the date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="flex flex-col space-y-8">
      <PageHeader
        title="Tax Rules Management"
        description="Configure and manage tax rates based on regions and product types"
        actions={
          <Button onClick={() => setIsAddingRule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Rule
          </Button>
        }
      />
      
      {isGuest && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                You are viewing sample data in guest mode. Changes will not be saved.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Card className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tax Compliance Overview</h2>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-700 dark:text-blue-300">
                  Important Tax Compliance Information
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Tax rules are used to determine the appropriate tax rate for invoices based on customer location and product types. 
                  Make sure to keep your tax rules up to date with the latest regulations.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    {taxRules.length} Tax Rules Configured
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-300">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Default Rule Set
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-300">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    {regionOptions.filter(region => 
                      taxRules.some(rule => rule.region === region)
                    ).length} Regions Covered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tax Rules</h2>
          <div className="w-64">
            <Input
              type="text"
              placeholder="Search tax rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name / Region
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product Types
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {rule.name}
                          </div>
                          {rule.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-300">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {rule.region}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${rule.category === 'standard' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300' : 
                        rule.category === 'reduced' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-300' :
                        rule.category === 'zero' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300' :
                        'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-300'}`
                    }>
                      {rule.category === 'standard' ? 'Standard' : 
                        rule.category === 'reduced' ? 'Reduced' :
                        rule.category === 'zero' ? 'Zero Rate' : 'Exempt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {rule.category === 'exempt' ? 'Exempt' : 
                        rule.category === 'zero' ? '0%' : 
                        `${rule.rate}%`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {rule.productTypes.map((type) => (
                        <span key={type} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                          <Package className="h-3 w-3 mr-1" />
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(rule.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No tax rules found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add/Edit Tax Rule Modal */}
      {(isAddingRule || editingRule) && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={() => {
              setIsAddingRule(false);
              setEditingRule(null);
            }}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {isAddingRule ? 'Add New Tax Rule' : 'Edit Tax Rule'}
                </h3>
                
                <div className="mt-4">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rule Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={editingRule ? editingRule.name : newRule.name}
                        onChange={(e) => 
                          editingRule 
                            ? setEditingRule({ ...editingRule, name: e.target.value })
                            : setNewRule({ ...newRule, name: e.target.value })
                        }
                        placeholder="e.g., US Sales Tax"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Region
                      </label>
                      <select
                        id="region"
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        value={editingRule ? editingRule.region : newRule.region}
                        onChange={(e) => 
                          editingRule 
                            ? setEditingRule({ ...editingRule, region: e.target.value })
                            : setNewRule({ ...newRule, region: e.target.value })
                        }
                      >
                        {regionOptions.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax Category
                      </label>
                      <select
                        id="category"
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        value={editingRule ? editingRule.category : newRule.category}
                        onChange={(e) => {
                          const value = e.target.value as TaxRateCategory;
                          if (editingRule) {
                            setEditingRule({ 
                              ...editingRule, 
                              category: value,
                              // Set rate to 0 for zero rate or exempt
                              rate: value === 'zero' || value === 'exempt' ? 0 : editingRule.rate
                            });
                          } else {
                            setNewRule({ 
                              ...newRule, 
                              category: value,
                              // Set rate to 0 for zero rate or exempt
                              rate: value === 'zero' || value === 'exempt' ? 0 : newRule.rate
                            });
                          }
                        }}
                      >
                        {taxCategories.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {taxCategories.find(c => c.value === (editingRule ? editingRule.category : newRule.category))?.description}
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tax Rate (%)
                      </label>
                      <Input
                        id="rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={
                          editingRule
                            ? editingRule.category === 'zero' || editingRule.category === 'exempt'
                              ? '0'
                              : editingRule.rate
                            : newRule.category === 'zero' || newRule.category === 'exempt'
                              ? '0'
                              : newRule.rate
                        }
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (editingRule) {
                            setEditingRule({ ...editingRule, rate: value });
                          } else {
                            setNewRule({ ...newRule, rate: value });
                          }
                        }}
                        disabled={
                          (editingRule && (editingRule.category === 'zero' || editingRule.category === 'exempt')) ||
                          (!editingRule && (newRule.category === 'zero' || newRule.category === 'exempt'))
                        }
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Applicable Product Types
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(editingRule ? editingRule.productTypes.length : newRule.productTypes.length)} selected
                        </span>
                      </div>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {productTypeOptions.map((type) => (
                          <label key={type} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={
                                editingRule
                                  ? editingRule.productTypes.includes(type)
                                  : newRule.productTypes.includes(type)
                              }
                              onChange={() => toggleProductType(type)}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        value={editingRule ? editingRule.description : newRule.description}
                        onChange={(e) => 
                          editingRule 
                            ? setEditingRule({ ...editingRule, description: e.target.value })
                            : setNewRule({ ...newRule, description: e.target.value })
                        }
                        placeholder="Provide additional details about this tax rule"
                      ></textarea>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isDefault"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={editingRule ? editingRule.isDefault : newRule.isDefault}
                        onChange={(e) => 
                          editingRule 
                            ? setEditingRule({ ...editingRule, isDefault: e.target.checked })
                            : setNewRule({ ...newRule, isDefault: e.target.checked })
                        }
                      />
                      <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900 dark:text-white">
                        Set as default tax rule
                      </label>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button 
                  className="w-full sm:w-auto sm:ml-2" 
                  onClick={editingRule ? handleUpdateRule : handleAddRule}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingRule ? 'Update Rule' : 'Add Rule'}
                </Button>
                <Button variant="outline" className="mt-3 w-full sm:mt-0 sm:w-auto" onClick={() => {
                  setIsAddingRule(false);
                  setEditingRule(null);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 