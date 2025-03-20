/**
 * Helper utilities for authentication-related operations
 */

/**
 * Thoroughly clears all Clerk-related data from the browser
 * to help resolve authentication errors
 */
export function clearClerkData() {
  // Clear localStorage items
  try {
    // Clear all Clerk-related items from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('clerk.') || key.startsWith('__clerk') || key.includes('clerk')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }

  // Clear sessionStorage items
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('clerk.') || key.startsWith('__clerk') || key.includes('clerk')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing sessionStorage:', e);
  }

  // Clear cookies
  try {
    document.cookie.split(";").forEach(c => {
      const cookieName = c.trim().split("=")[0];
      if (cookieName.startsWith('__clerk') || cookieName.includes('clerk')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  } catch (e) {
    console.error('Error clearing cookies:', e);
  }
}

/**
 * Redirects to the logout endpoint and then to the specified URL
 */
export function logoutAndRedirect(redirectUrl = '/') {
  // First clear browser data
  clearClerkData();
  
  // Set sign-out flag
  localStorage.setItem('user_signed_out', 'true');
  
  // Redirect to the logout API endpoint
  window.location.href = `/api/auth/logout?redirect_url=${encodeURIComponent(redirectUrl)}`;
} 