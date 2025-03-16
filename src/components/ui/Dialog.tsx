'use client';

import React, { Fragment } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

// Main Dialog component
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel>
              {children}
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

// Dialog Content
interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

const DialogContent = ({ className, children }: DialogContentProps) => {
  return (
    <div
      className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg ${className || ''}`}
    >
      {children}
    </div>
  );
};

// Dialog Header
interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const DialogHeader = ({ className, children }: DialogHeaderProps) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      {children}
    </div>
  );
};

// Dialog Title
interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

const DialogTitle = ({ className, children }: DialogTitleProps) => {
  return (
    <HeadlessDialog.Title 
      as="h3" 
      className={`text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 ${className || ''}`}
    >
      {children}
    </HeadlessDialog.Title>
  );
};

// Dialog Description
interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const DialogDescription = ({ className, children }: DialogDescriptionProps) => {
  return (
    <HeadlessDialog.Description
      className={`text-sm text-gray-500 dark:text-gray-400 mt-2 ${className || ''}`}
    >
      {children}
    </HeadlessDialog.Description>
  );
};

// Dialog Footer
interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

const DialogFooter = ({ className, children }: DialogFooterProps) => {
  return (
    <div className={`mt-6 flex justify-end gap-3 ${className || ''}`}>
      {children}
    </div>
  );
};

// Assign subcomponents
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Footer = DialogFooter;

export { Dialog }; 