'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import type { AuthContextValue, AuthUser } from '@/types/auth';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error(
        '[AuthContext] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. ' +
          'Google Sign-In will not work. Please add it to your .env.local file.'
      );
    }
  }, []);

  const login = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata',
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch user info: ${res.status}`);
        }
        const info = await res.json();
        setUser({
          name: info.name ?? '',
          email: info.email ?? '',
          picture: info.picture ?? '',
          accessToken: tokenResponse.access_token,
        });
      } catch (err) {
        setError('No se pudo obtener la información del usuario. Intenta de nuevo.');
        console.error('[AuthContext] Error fetching user info:', err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      const description = errorResponse.error_description ?? errorResponse.error;
      const errorCode = errorResponse.error as string | undefined;
      if (errorCode === 'access_denied' || errorCode === 'popup_closed_by_user') {
        setError('Inicio de sesión cancelado. Puedes intentarlo de nuevo cuando quieras.');
      } else {
        setError(
          description
            ? `Error de autenticación: ${description}`
            : 'Ocurrió un error durante el inicio de sesión. Intenta de nuevo.'
        );
      }
      setIsLoading(false);
    },
  });

  const signIn = useCallback(() => {
    setError(null);
    setIsLoading(true);
    login();
  }, [login]);

  const signOut = useCallback(() => {
    googleLogout();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
