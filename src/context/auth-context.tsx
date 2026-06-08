'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: AuthUser | null;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const { user } = await api.get<{ user: AuthUser }>('/api/auth/me');
        return user;
      } catch {
        return null;
      }
    },
    initialData: initialUser,
    staleTime: 60_000,
    retry: false,
  });

  const user = data ?? null;

  const logout = React.useCallback(async () => {
    await api.post('/api/auth/logout');
    queryClient.setQueryData(['me'], null);
    queryClient.clear();
  }, [queryClient]);

  const setUser = React.useCallback(
    (u: AuthUser | null) => {
      queryClient.setQueryData(['me'], u);
    },
    [queryClient],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
