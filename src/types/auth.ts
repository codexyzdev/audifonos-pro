export interface AuthUser {
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
}

export type SyncStatus = 'sincronizado' | 'sincronizando' | 'error';

export interface DriveServiceResult<T> {
  data: T | null;
  error: string | null;
}
