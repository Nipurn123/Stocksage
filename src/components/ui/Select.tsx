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
    const baseSelectClasses = `
      rounded-md 
      border border-gray-300 
      bg-white 
      text-gray-900 
      shadow-sm 
      focus:border-primary-500 
      focus:ring-primary-500
      dark:border-gray-700
      dark:bg-gray-800
      dark:text-gray-200
      transition-colors
      duration-200
    `;
    
    // Error classes
    const errorClasses = error 
      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:text-red-300' 
      : '';
    
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
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
            {label}
          </label>
        )}
        <div className="relative">
          <select ref={ref} className={selectClasses} {...props}>
            {options ? options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            )) : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} transition-colors duration-200`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 