'use client';

/**
 * DOM utilities that ensure safe manipulation only after hydration.
 * These utilities help prevent hydration mismatches by deferring DOM operations
 * until after the initial client-side render.
 */

// Check if we're running on the client side
export const isClient = typeof window !== 'undefined';

/**
 * Safely execute a DOM operation after hydration is complete
 * @param callback Function to execute on the client side
 */
export function safeDOM(callback: () => void): void {
  if (!isClient) return;
  
  // Use requestAnimationFrame to ensure we're past hydration
  if (document.readyState === 'complete') {
    // If document is already loaded, schedule in next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        callback();
      });
    });
  } else {
    // Otherwise wait for load event first
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          callback();
        });
      });
    });
  }
}

/**
 * Add a class to an HTML element safely after hydration
 */
export function safelyAddClass(element: HTMLElement, className: string): void {
  safeDOM(() => {
    element.classList.add(className);
  });
}

/**
 * Remove a class from an HTML element safely after hydration
 */
export function safelyRemoveClass(element: HTMLElement, className: string): void {
  safeDOM(() => {
    element.classList.remove(className);
  });
}

/**
 * Set an attribute on an HTML element safely after hydration
 */
export function safelySetAttribute(element: HTMLElement, name: string, value: string): void {
  safeDOM(() => {
    element.setAttribute(name, value);
  });
}

/**
 * Replace classes on an HTML element safely after hydration
 * First removes all classes in the removeClasses array, then adds the addClass
 */
export function safelyReplaceClass(
  element: HTMLElement, 
  removeClasses: string[], 
  addClass: string
): void {
  safeDOM(() => {
    removeClasses.forEach(cls => element.classList.remove(cls));
    element.classList.add(addClass);
  });
} 