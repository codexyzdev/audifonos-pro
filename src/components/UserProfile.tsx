'use client';

import Image from 'next/image';
import { LogOut, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SyncStatus } from '@/types/auth';

interface UserProfileProps {
  syncStatus?: SyncStatus;
  lastSyncedAt?: Date | null;
  syncError?: string | null;
  onRetry?: () => void;
}

function SyncRow({ syncStatus, lastSyncedAt, syncError, onRetry }: UserProfileProps) {
  if (!syncStatus) return null;

  const time = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : null;

  if (syncStatus === 'sincronizado') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Sincronizado{time ? ` · ${time}` : ''}</span>
      </div>
    );
  }

  if (syncStatus === 'sincronizando') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
        <span>Sincronizando…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{syncError ?? 'Error al sincronizar'}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-violet-400 hover:text-violet-300 underline transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function UserProfile({ syncStatus, lastSyncedAt, syncError, onRetry }: UserProfileProps) {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-150 outline-none"
          aria-label="Menú de perfil"
        >
          <Image
            src={user.picture}
            alt={user.name}
            width={28}
            height={28}
            className="rounded-full shrink-0 ring-2 ring-violet-500/40"
            referrerPolicy="no-referrer"
          />
          <span className="text-sm font-medium text-gray-300 hidden sm:block truncate max-w-[120px]">
            {user.name}
          </span>
          <svg className="w-3.5 h-3.5 text-gray-500 hidden sm:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 bg-gray-900 border-white/10 text-gray-200 shadow-2xl">
        {/* User info */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center gap-3">
            <Image
              src={user.picture}
              alt={user.name}
              width={36}
              height={36}
              className="rounded-full ring-2 ring-violet-500/40 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">{user.name}</span>
              <span className="text-xs text-gray-400 truncate">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Sync status */}
        <div className="px-2 py-2">
          <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Sincronización</p>
          <SyncRow
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            syncError={syncError}
            onRetry={onRetry}
          />
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={signOut}
          className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
