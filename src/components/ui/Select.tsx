import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options?: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
  children?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      helperText,
      className = '',
      fullWidth = false,
      size = 'md',
      containerClassName = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base select classes
    const baseSelectClasses = 'rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500';
    
    // Error classes
    const errorClasses = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : '';
    
    // Size classes
    const sizeClasses = {
      sm: 'py-1 text-sm',
      md: 'py-2 text-base',
      lg: 'py-3 text-lg',
    };
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Compute final classes
    const selectClasses = `${baseSelectClasses} ${errorClasses} ${sizeClasses[size]} ${widthClasses} ${className}`;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select ref={ref} className={selectClasses} {...props}>
          {options ? options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          )) : children}
        </select>
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 