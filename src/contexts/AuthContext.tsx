'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import type { AuthContextValue, AuthUser } from '@/types/auth';

const AUTH_HINT_KEY = 'audifonos-auth-hint';
const SCOPE = 'openid email profile https://www.googleapis.com/auth/drive.appdata';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            hint?: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

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

/** Silent restore using the native GIS tokenClient (no popup, no prompt). */
function trySilentRestore(
  clientId: string,
  hint: string,
  onSuccess: (token: string) => void,
  onError: () => void
) {
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    onError();
    return;
  }
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPE,
    hint,
    prompt: '',
    callback: (response: { access_token?: string; error?: string }) => {
      if (response.access_token) {
        onSuccess(response.access_token);
      } else {
        onError();
      }
    },
  });
  client.requestAccessToken({ prompt: '' });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    scope: SCOPE,
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

  // Attempt silent restore on mount using native GIS API with the stored hint
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const hint = localStorage.getItem(AUTH_HINT_KEY);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!hint || !clientId) return;

    setIsRestoring(true);

    // Wait for the GIS script to be ready
    const attempt = () => {
      trySilentRestore(
        clientId,
        hint,
        async (token) => {
          try {
            await handleTokenResponse(token);
          } catch {
            // silent fail
          } finally {
            setIsRestoring(false);
          }
        },
        () => setIsRestoring(false)
      );
    };

    if (window.google?.accounts?.oauth2) {
      attempt();
    } else {
      // Poll until GIS script loads (max ~3s)
      let tries = 0;
      const interval = setInterval(() => {
        tries++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          attempt();
        } else if (tries >= 15) {
          clearInterval(interval);
          setIsRestoring(false);
        }
      }, 200);
    }
  }, [handleTokenResponse]);

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
