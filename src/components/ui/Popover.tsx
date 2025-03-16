'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const PopoverContext = createContext<PopoverContextValue | undefined>(undefined);

const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within a Popover');
  }
  return context;
};

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Popover({ children, open, onOpenChange }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const triggerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      const content = document.querySelector('[data-popover-content="true"]');
      if (content && !content.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const value = { open: isOpen, setOpen: setIsOpen, triggerRef };

  return (
    <PopoverContext.Provider value={value}>
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

function PopoverTrigger({ children, asChild = false }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef } = usePopover();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(!open);
  };

  if (asChild) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        children.props.onClick?.(e);
      },
      'aria-expanded': open,
    });
  }

  return React.cloneElement(children, {
    ref: triggerRef,
    onClick: handleClick,
    'aria-expanded': open,
  });
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

function PopoverContent({
  children,
  className = '',
  sideOffset = 4,
  align = 'center',
}: PopoverContentProps) {
  const { open, triggerRef } = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      let top = triggerRect.bottom + sideOffset;
      let left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      
      // Handle alignment
      if (align === 'start') {
        left = triggerRect.left;
      } else if (align === 'end') {
        left = triggerRect.right - contentRect.width;
      }
      
      // Keep the popover in the viewport
      if (left < 0) left = 10;
      if (left + contentRect.width > window.innerWidth) {
        left = window.innerWidth - contentRect.width - 10;
      }
      
      setPosition({ top, left });
    }
  }, [open, sideOffset, align]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 min-w-[8rem] rounded-md border bg-background p-4 shadow-md outline-none animate-in fade-in-80 ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        position: 'fixed',
      }}
      data-popover-content="true"
    >
      {children}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent }; 