'use client';

import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={`border-b border-gray-200 dark:border-gray-800 ${className}`}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={`divide-y divide-gray-200 dark:divide-gray-800 ${className}`}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${className}`}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {}

const TableHeader = React.forwardRef<HTMLTableHeaderCellElement, TableHeaderCellProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 ${className}`}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableDataCellElement> {}

const TableCell = React.forwardRef<HTMLTableDataCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={`px-4 py-4 align-middle ${className}`}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

export { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableHeader, 
  TableCell 
};

export default Table; 