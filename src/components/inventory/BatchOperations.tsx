'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  Trash2, Edit, Check, X, AlertTriangle, 
  Loader2, BrainCircuit, Save
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currentStock?: number;
  minStockLevel?: number;
  category: string;
  checked?: boolean;
}

interface BatchOperationsProps {
  products: Product[];
  onProductsUpdated: () => void;
  visible: boolean;
}

type OperationType = 'update' | 'delete' | 'aiSuggestions';
type AiOperationType = 'stockLevel' | 'pricing' | 'categorization';

export default function BatchOperations({ 
  products, 
  onProductsUpdated,
  visible 
}: BatchOperationsProps) {
  const { getToken } = useAuth();
  
  // State for selected products
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for batch operations
  const [operationType, setOperationType] = useState<OperationType>('update');
  const [aiOperation, setAiOperation] = useState<AiOperationType>('stockLevel');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for batch update form
  const [updateData, setUpdateData] = useState({
    category: '',
    price: '',
    cost: '',
    minStockLevel: ''
  });
  
  // State for AI suggestions
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  
  // Handle selection changes
  const handleSelectProduct = (product: Product, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, { ...product, checked: true }]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedProducts(products.map(p => ({ ...p, checked: true })));
    } else {
      setSelectedProducts([]);
    }
  };
  
  // Reset states when products change
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, [products]);
  
  // Open dialog for operation
  const openOperationDialog = (type: OperationType) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    
    setOperationType(type);
    setError(null);
    setProcessingResult(null);
    setAiSuggestions(null);
    setIsDialogOpen(true);
  };
  
  // Process batch update
  const handleBatchUpdate = async () => {
    if (selectedProducts.length === 0) return;
    
    // Validate input data
    const data: any = {};
    if (updateData.category) data.category = updateData.category;
    if (updateData.price) data.price = parseFloat(updateData.price);
    if (updateData.cost) data.cost = parseFloat(updateData.cost);
    if (updateData.minStockLevel) data.minStockLevel = parseInt(updateData.minStockLevel);
    
    if (Object.keys(data).length === 0) {
      setError('Please provide at least one field to update');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const token = await getToken();
      const productIds = selectedProducts.map(p => p.id);
      
      const response = await fetch('/api/inventory/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds,
          data
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update products');
      }
      
      setProcessingResult(result.data);
      toast.success(`Successfully updated ${result.data.filter((r: any) => r.success).length} products`);
      onProductsUpdated(); // Refresh product list
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating products');
      toast.error('Failed to update products');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process batch delete
  const handleBatchDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const token = await getToken();
      const productIds = selectedProducts.map(p => p.id);
      
      const response = await fetch('/api/inventory/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete products');
      }
      
      setProcessingResult(result.data);
      toast.success(`Successfully deleted ${result.data.filter((r: any) => r.success).length} products`);
      onProductsUpdated(); // Refresh product list
      setIsDialogOpen(false); // Close dialog after successful deletion
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting products');
      toast.error('Failed to delete products');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Generate AI suggestions
  const handleGenerateAiSuggestions = async () => {
    if (selectedProducts.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setAiSuggestions(null);
    
    try {
      const token = await getToken();
      const productIds = selectedProducts.map(p => p.id);
      
      const response = await fetch('/api/inventory/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds,
          operation: aiOperation,
          prompt: aiPrompt || undefined
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate suggestions');
      }
      
      setAiSuggestions(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating suggestions');
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Apply AI suggestions to update form
  const applyAiSuggestions = () => {
    if (!aiSuggestions || !aiSuggestions.batchSuggestions) return;
    
    const { common } = aiSuggestions.batchSuggestions;
    
    if (common && common.fields) {
      const newUpdateData = { ...updateData };
      
      if (common.fields.category) newUpdateData.category = common.fields.category;
      if (common.fields.price) newUpdateData.price = common.fields.price.toString();
      if (common.fields.cost) newUpdateData.cost = common.fields.cost.toString();
      if (common.fields.minStockLevel) newUpdateData.minStockLevel = common.fields.minStockLevel.toString();
      
      setUpdateData(newUpdateData);
      toast.success('Applied AI suggestions to form');
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className="bg-card shadow rounded-lg p-4 mb-6 border">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Batch Operations</h2>
        <p className="text-muted-foreground text-sm">
          Select products and perform operations on multiple items at once
        </p>
      </div>
      
      {/* Selection Controls */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="border-gray-300 rounded h-4 w-4"
            title="Select all products"
            aria-label="Select all products"
          />
          <span className="text-sm font-medium">
            Select All ({products.length})
          </span>
        </div>
        
        <div className="ml-auto flex gap-2">
          <Badge variant="primary">
            {selectedProducts.length} selected
          </Badge>
        </div>
      </div>
      
      {/* Product Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4 max-h-60 overflow-y-auto">
        {products.map(product => (
          <div 
            key={product.id}
            className={`border rounded-md p-2 text-sm flex items-start gap-2 ${
              selectedProducts.some(p => p.id === product.id) 
                ? 'bg-primary/10 border-primary' 
                : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedProducts.some(p => p.id === product.id)}
              onChange={(e) => handleSelectProduct(product, e.target.checked)}
              className="border-gray-300 rounded h-4 w-4 mt-1"
              title={`Select ${product.name}`}
              aria-label={`Select ${product.name}`}
            />
            <div className="flex-grow">
              <div className="font-medium truncate">{product.name}</div>
              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
              <div className="flex justify-between mt-1">
                <span className="text-xs">{formatCurrency(product.price)}</span>
                <span className="text-xs">Stock: {product.currentStock || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Operation Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => openOperationDialog('update')}
          disabled={selectedProducts.length === 0}
        >
          <Edit className="h-4 w-4 mr-1" />
          Update
        </Button>
        
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => openOperationDialog('delete')}
          disabled={selectedProducts.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => openOperationDialog('aiSuggestions')}
          disabled={selectedProducts.length === 0}
        >
          <BrainCircuit className="h-4 w-4 mr-1" />
          AI Suggestions
        </Button>
      </div>
      
      {/* Operation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {operationType === 'update' && 'Batch Update Products'}
              {operationType === 'delete' && 'Delete Multiple Products'}
              {operationType === 'aiSuggestions' && 'Generate AI Suggestions'}
            </Dialog.Title>
            <Dialog.Description>
              {operationType === 'update' && 'Update properties for multiple products at once.'}
              {operationType === 'delete' && `Are you sure you want to delete ${selectedProducts.length} products?`}
              {operationType === 'aiSuggestions' && 'Generate AI-powered suggestions for your selected products.'}
            </Dialog.Description>
          </Dialog.Header>
          
          {/* Update Form */}
          {operationType === 'update' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={updateData.category}
                    onChange={(e) => setUpdateData({ ...updateData, category: e.target.value })}
                    placeholder="Category"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    value={updateData.price}
                    onChange={(e) => setUpdateData({ ...updateData, price: e.target.value })}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost</label>
                  <Input
                    type="number"
                    value={updateData.cost}
                    onChange={(e) => setUpdateData({ ...updateData, cost: e.target.value })}
                    placeholder="Cost"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Stock Level</label>
                  <Input
                    type="number"
                    value={updateData.minStockLevel}
                    onChange={(e) => setUpdateData({ ...updateData, minStockLevel: e.target.value })}
                    placeholder="Min Stock Level"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
              
              {aiSuggestions && (
                <div className="bg-secondary/20 p-3 rounded-md border border-secondary mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">AI Suggestions</h4>
                    <Button variant="ghost" size="sm" onClick={applyAiSuggestions}>
                      <Check className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                  {aiSuggestions.batchSuggestions?.common?.reasoning && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {aiSuggestions.batchSuggestions.common.reasoning}
                    </p>
                  )}
                  {aiSuggestions.expectedImpact && (
                    <p className="text-xs font-medium">
                      Impact: {aiSuggestions.expectedImpact}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Delete Confirmation */}
          {operationType === 'delete' && (
            <div className="py-4">
              <div className="bg-destructive/10 p-4 rounded-md flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Warning: This action cannot be undone</p>
                  <p className="text-muted-foreground">
                    You are about to delete {selectedProducts.length} products from your inventory.
                    This will also remove all associated inventory logs and history.
                  </p>
                </div>
              </div>
              
              <div className="max-h-32 overflow-y-auto">
                <h4 className="text-sm font-medium mb-2">Selected Products:</h4>
                <ul className="text-sm space-y-1">
                  {selectedProducts.slice(0, 5).map(product => (
                    <li key={product.id} className="truncate">{product.name}</li>
                  ))}
                  {selectedProducts.length > 5 && (
                    <li>...and {selectedProducts.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          {/* AI Suggestions Form */}
          {operationType === 'aiSuggestions' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Suggestion Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={aiOperation === 'stockLevel' ? 'primary' : 'outline'}
                    onClick={() => setAiOperation('stockLevel')}
                    className="w-full"
                    size="sm"
                  >
                    Stock Levels
                  </Button>
                  <Button
                    type="button"
                    variant={aiOperation === 'pricing' ? 'primary' : 'outline'}
                    onClick={() => setAiOperation('pricing')}
                    className="w-full"
                    size="sm"
                  >
                    Pricing
                  </Button>
                  <Button
                    type="button"
                    variant={aiOperation === 'categorization' ? 'primary' : 'outline'}
                    onClick={() => setAiOperation('categorization')}
                    className="w-full"
                    size="sm"
                  >
                    Categories
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Instructions (Optional)</label>
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., 'Optimize for seasonal demand' or 'Focus on profitability'"
                />
              </div>
              
              {aiSuggestions && (
                <div className="bg-card border rounded-md p-4 max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2">AI Recommendations</h4>
                  
                  {aiSuggestions.batchSuggestions?.common && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">Common Suggestions</h5>
                      <p className="text-sm mb-1">{aiSuggestions.batchSuggestions.common.reasoning}</p>
                      {aiSuggestions.batchSuggestions.common.fields && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {Object.entries(aiSuggestions.batchSuggestions.common.fields).map(([key, value]) => (
                            <div key={key} className="bg-secondary/10 px-2 py-1 rounded text-xs">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {aiSuggestions.recommendations && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium uppercase text-muted-foreground mb-1">Recommendations</h5>
                      <ul className="text-sm space-y-1">
                        {aiSuggestions.recommendations.map((rec: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>{rec.action}: <span className="text-muted-foreground">{rec.expectedOutcome}</span></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiSuggestions.expectedImpact && (
                    <div className="text-sm mt-3 pt-3 border-t">
                      <span className="font-medium">Expected Impact:</span> {aiSuggestions.expectedImpact}
                    </div>
                  )}
                  
                  <div className="mt-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setOperationType('update')}
                    >
                      Apply to Update Form
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mt-2">
              {error}
            </div>
          )}
          
          {/* Results Display */}
          {processingResult && (
            <div className="bg-card border rounded-md p-3 mt-2 max-h-32 overflow-y-auto">
              <h4 className="text-sm font-medium mb-1">Results</h4>
              <ul className="text-xs space-y-1">
                {Array.isArray(processingResult) ? (
                  processingResult.map((result: any) => (
                    <li key={result.id} className="flex items-center gap-1">
                      {result.success ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-destructive" />
                      )}
                      <span>
                        {result.id}: {result.success ? 'Success' : result.error || 'Failed'}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>Processing completed</li>
                )}
              </ul>
            </div>
          )}
          
          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            {operationType === 'update' && (
              <Button
                variant="primary"
                onClick={handleBatchUpdate}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Products
                  </>
                )}
              </Button>
            )}
            
            {operationType === 'delete' && (
              <Button
                variant="danger"
                onClick={handleBatchDelete}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Products
                  </>
                )}
              </Button>
            )}
            
            {operationType === 'aiSuggestions' && (
              <Button
                variant="primary"
                onClick={handleGenerateAiSuggestions}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
} 