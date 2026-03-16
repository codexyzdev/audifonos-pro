'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Image
        src={user.picture}
        alt={user.name}
        width={32}
        height={32}
        className="rounded-full"
        referrerPolicy="no-referrer"
      />
      <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
      <button
        onClick={signOut}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="Cerrar sesión"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:block">Cerrar sesión</span>
      </button>
    </div>
  );
}
