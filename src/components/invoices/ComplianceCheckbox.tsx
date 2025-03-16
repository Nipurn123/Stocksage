'use client';

import React, { useState } from 'react';
import { Checkbox, Label, Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { InfoIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ComplianceCheckboxProps {
  invoiceId: string;
  initialStatus: boolean;
  complianceNotes?: string;
  readonly?: boolean;
}

export default function ComplianceCheckbox({
  invoiceId,
  initialStatus,
  complianceNotes = '',
  readonly = false,
}: ComplianceCheckboxProps) {
  const [isCompliant, setIsCompliant] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = async (checked: boolean) => {
    if (readonly) return;
    
    setIsLoading(true);
    
    try {
      // Make API call to update compliance status
      const response = await fetch(`/api/invoices/${invoiceId}/compliance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompliant: checked }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update compliance status');
      }
      
      setIsCompliant(checked);
      toast.success(`Invoice ${checked ? 'marked as compliant' : 'marked as non-compliant'}`);
    } catch (error) {
      console.error('Error updating compliance status:', error);
      toast.error('Failed to update compliance status');
      // Revert to the original state
      setIsCompliant(initialStatus);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`compliance-${invoiceId}`}
        checked={isCompliant}
        onCheckedChange={handleChange}
        disabled={isLoading || readonly}
      />
      <div className="flex items-center">
        <Label
          htmlFor={`compliance-${invoiceId}`}
          className={`text-sm font-medium ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          Tax Compliant
        </Label>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 ml-1">
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">More information</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Tax Compliance Status</h4>
              {isCompliant ? (
                <div className="flex items-start space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    This invoice meets all tax compliance requirements.
                  </p>
                </div>
              ) : (
                <div className="flex items-start space-x-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    This invoice may not meet all tax compliance requirements.
                    Please review tax information and customer details.
                  </p>
                </div>
              )}
              
              {complianceNotes && (
                <div className="mt-2">
                  <h5 className="text-xs font-medium mb-1">Notes:</h5>
                  <p className="text-xs text-muted-foreground">{complianceNotes}</p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>
                  Marking an invoice as compliant indicates that it includes
                  all required tax information and complies with local regulations.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 