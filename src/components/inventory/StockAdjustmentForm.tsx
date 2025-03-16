import React, { useState } from 'react';
import { Button, Input, Label, Textarea } from '@/components/ui';
import { PlusCircle, MinusCircle, AlertTriangle } from 'lucide-react';

interface StockAdjustmentFormProps {
  productId: string;
  currentStock: number;
  onSuccess: () => void;
}

export default function StockAdjustmentForm({ 
  productId, 
  currentStock, 
  onSuccess 
}: StockAdjustmentFormProps) {
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [reference, setReference] = useState<string>('Manual Adjustment');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate
    if (quantity <= 0) {
      setError('Quantity must be greater than zero');
      setIsSubmitting(false);
      return;
    }

    if (adjustmentType === 'out' && quantity > currentStock) {
      setError('Cannot remove more units than currently in stock');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/inventory/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantityChange: quantity,
          type: adjustmentType,
          reference,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      // Reset form
      setQuantity(1);
      setReference('Manual Adjustment');
      setNotes('');
      setSuccess(true);
      
      // Notify parent
      onSuccess();
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 dark:bg-green-900/20 dark:border-green-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <PlusCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">
                Stock adjustment successful
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="adjustmentType">Adjustment Type</Label>
          <div className="flex space-x-4">
            <div 
              className={`flex-1 flex items-center justify-center p-3 border rounded-md cursor-pointer ${
                adjustmentType === 'in' 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => setAdjustmentType('in')}
            >
              <PlusCircle className={`h-5 w-5 mr-2 ${
                adjustmentType === 'in' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
              }`} />
              <span className={adjustmentType === 'in' ? 'font-medium' : ''}>Add Stock</span>
            </div>
            <div 
              className={`flex-1 flex items-center justify-center p-3 border rounded-md cursor-pointer ${
                adjustmentType === 'out' 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => setAdjustmentType('out')}
            >
              <MinusCircle className={`h-5 w-5 mr-2 ${
                adjustmentType === 'out' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
              }`} />
              <span className={adjustmentType === 'out' ? 'font-medium' : ''}>Remove Stock</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={adjustmentType === 'out' ? currentStock : undefined}
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          />
          <p className="text-sm text-gray-500">
            {adjustmentType === 'in' 
              ? `Stock will increase from ${currentStock} to ${currentStock + quantity}`
              : `Stock will decrease from ${currentStock} to ${Math.max(0, currentStock - quantity)}`
            }
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference</Label>
        <Input
          id="reference"
          placeholder="e.g., Purchase, Sale, Inventory Count"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details about this adjustment"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? 'Processing...' 
            : adjustmentType === 'in' 
              ? 'Add Stock' 
              : 'Remove Stock'
          }
        </Button>
      </div>
    </form>
  );
} 