'use client';

import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import type { SyncStatus } from '@/types/auth';

interface SyncIndicatorProps {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  error: string | null;
  onRetry: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function SyncIndicator({ status, lastSyncedAt, error, onRetry }: SyncIndicatorProps) {
  if (status === 'sincronizado') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Sincronizado</span>
        {lastSyncedAt && (
          <span className="text-green-600 opacity-75">{formatTime(lastSyncedAt)}</span>
        )}
      </span>
    );
  }

  if (status === 'sincronizando') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 whitespace-nowrap">
        <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
        <span className="hidden sm:inline">Sincronizando…</span>
      </span>
    );
  }

  // error
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 whitespace-nowrap">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden sm:inline">{error ?? 'Error'}</span>
      <button
        onClick={onRetry}
        className="underline hover:no-underline focus:outline-none"
        aria-label="Reintentar sincronización"
      >
        Reintentar
      </button>
    </span>
  );
}
