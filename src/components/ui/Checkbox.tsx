'use client';

import React, { forwardRef } from 'react';
import { CheckIcon } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', onCheckedChange, checked, disabled, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        <div
          className={`
            h-4 w-4 shrink-0 rounded-sm border border-primary 
            ring-offset-background transition-colors 
            focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50 
            data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
            peer-checked:bg-primary-600 peer-checked:border-primary-600
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
          aria-hidden="true"
        >
          {checked && (
            <CheckIcon className="h-3 w-3 text-white absolute inset-0 m-auto" />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 