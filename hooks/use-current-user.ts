import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface User {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  postsCount?: number;
}

export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    if (!isLoaded || !user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?clerkId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch current user');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCurrentUser(data[0]);
      } else if (data.user) {
        setCurrentUser(data.user);
      } else {
        // User not found, try to create
        const createRes = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.emailAddresses?.[0]?.emailAddress || '',
            username: user.username || user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || '',
            name: user.fullName || user.firstName || user.lastName || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            avatar: user.imageUrl || '',
          }),
        });
        if (!createRes.ok) {
          throw new Error('Failed to create user');
        }
        const createData = await createRes.json();
        if (createData.user) {
          setCurrentUser(createData.user);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error fetching user');
      }
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return { currentUser, loading, error, refetch: fetchCurrentUser };
} 