import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      fullWidth = false,
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    // Base input classes
    const baseInputClasses = 'rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500';
    
    // Error classes
    const errorClasses = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : '';
    
    // Icon padding classes
    const iconPaddingClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Compute final classes
    const inputClasses = `${baseInputClasses} ${errorClasses} ${iconPaddingClasses} ${widthClasses} ${className}`;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...props} />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 