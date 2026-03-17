'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import type { AuthContextValue, AuthUser } from '@/types/auth';

const AUTH_HINT_KEY = 'audifonos-auth-hint';

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserInfo(accessToken: string): Promise<AuthUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
  const info = await res.json();
  return {
    name: info.name ?? '',
    email: info.email ?? '',
    picture: info.picture ?? '',
    accessToken,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const silentLoginRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error('[AuthContext] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.');
    }
  }, []);

  const handleTokenResponse = useCallback(async (accessToken: string) => {
    const userInfo = await fetchUserInfo(accessToken);
    localStorage.setItem(AUTH_HINT_KEY, userInfo.email);
    setUser(userInfo);
  }, []);

  const login = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata',
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        await handleTokenResponse(tokenResponse.access_token);
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

  const silentLogin = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata',
    prompt: 'none',
    hint: undefined,
    onSuccess: async (tokenResponse) => {
      try {
        await handleTokenResponse(tokenResponse.access_token);
      } catch {
        // silent fail — user will see login screen
      } finally {
        setIsRestoring(false);
      }
    },
    onError: () => {
      // silent fail — user will see login screen normally
      setIsRestoring(false);
    },
  });

  // Store ref so we can call it from useEffect
  useEffect(() => {
    silentLoginRef.current = () => silentLogin();
  }, [silentLogin]);

  // Attempt silent restore on mount if we have a hint
  useEffect(() => {
    const hint = localStorage.getItem(AUTH_HINT_KEY);
    if (!hint) return;
    setIsRestoring(true);
    // Small delay to ensure GoogleOAuthProvider is ready
    const t = setTimeout(() => silentLoginRef.current?.(), 300);
    return () => clearTimeout(t);
  }, []);

  const signIn = useCallback(() => {
    setError(null);
    setIsLoading(true);
    login();
  }, [login]);

  const signOut = useCallback(() => {
    googleLogout();
    localStorage.removeItem(AUTH_HINT_KEY);
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isRestoring, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
