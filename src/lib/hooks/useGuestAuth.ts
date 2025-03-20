import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isGuestUserId } from '@/lib/auth/guestAuth';

interface GuestAuthHook {
  isLoading: boolean;
  isGuestUser: boolean;
  startGuestSession: () => Promise<void>;
  endGuestSession: () => Promise<void>;
}

/**
 * Hook for handling guest authentication
 */
export function useGuestAuth(): GuestAuthHook {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);
  
  // Check if the user has a guest session
  useEffect(() => {
    async function checkGuestSession() {
      try {
        const response = await fetch('/api/auth/guest');
        const data = await response.json();
        
        setIsGuestUser(data.hasGuestSession);
      } catch (error) {
        console.error('Failed to check guest session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkGuestSession();
  }, []);
  
  // Start a guest session
  const startGuestSession = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsGuestUser(true);
        router.refresh(); // Refresh the page to update the user state
      } else {
        throw new Error(data.error || 'Failed to start guest session');
      }
    } catch (error) {
      console.error('Failed to start guest session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  // End the guest session
  const endGuestSession = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/auth/guest', {
        method: 'DELETE',
      });
      
      setIsGuestUser(false);
      router.refresh(); // Refresh the page to update the user state
    } catch (error) {
      console.error('Failed to end guest session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  return {
    isLoading,
    isGuestUser,
    startGuestSession,
    endGuestSession,
  };
} 