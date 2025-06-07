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
    const baseInputClasses = `
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
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:text-red-300 dark:placeholder-red-700'
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
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400 transition-colors duration-200">
              {leftIcon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...props} />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400 transition-colors duration-200">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

export default Input; 