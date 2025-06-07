'use client';

import { isClient, safelyReplaceClass, safelyAddClass, safelyRemoveClass } from './dom-utils';

/**
 * Safely applies a theme to the document root element after hydration is complete
 * @param theme The theme to apply ('light' or 'dark')
 */
export function safelyApplyTheme(theme: 'light' | 'dark'): void {
  if (!isClient) return;
  
  const root = document.documentElement;
  safelyReplaceClass(root, ['light', 'dark'], theme);
}

/**
 * Safely adds a class to the document root element after hydration
 * @param className The class to add
 */
export function addClassToRoot(className: string): void {
  if (!isClient) return;
  
  const root = document.documentElement;
  safelyAddClass(root, className);
}

/**
 * Safely removes a class from the document root element after hydration
 * @param className The class to remove
 */
export function removeClassFromRoot(className: string): void {
  if (!isClient) return;
  
  const root = document.documentElement;
  safelyRemoveClass(root, className);
}

// Re-export isClient for convenience
export { isClient }; 