import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  headerAction?: React.ReactNode;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  contentClassName = '',
  noPadding = false,
  headerAction,
  icon,
}) => {
  return (
    <div className={`bg-white dark:bg-black dark:border dark:border-gray-800 shadow rounded-lg overflow-hidden ${className}`}>
      {(title || subtitle || headerAction || icon) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
          <div className="flex items-center">
            {icon && <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="ml-4">{headerAction}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'px-6 py-4'} ${contentClassName}`}>{children}</div>
      {footer && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">{footer}</div>}
    </div>
  );
};

export default Card; 