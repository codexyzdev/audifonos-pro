'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useInventory } from '@/inventory/hooks/use-inventory';
import { ColorCard } from '@/inventory/components/color-card';
import { EntryForm } from '@/inventory/components/entry-form';
import { ExitForm } from '@/inventory/components/exit-form';
import { StatsCard } from '@/inventory/components/stats-card';
import { TransactionHistory } from '@/inventory/components/transaction-history';
import { AnimatedBackground } from '@/shared/components/animated-background';
import { AppHeader } from '@/shared/components/app-header';
import { LoginScreen } from '@/components/LoginScreen';
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import type { ColorType } from '@/inventory/types';
import { Package, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export function InventoryDashboard() {
  const { user, signOut } = useAuth();

  const {
    inventory,
    isLoaded,
    syncStatus,
    lastSyncedAt,
    syncError,
    retrySync,
    addEntry,
    addMultiExit,
    getTotalStock,
    getTotalEntries,
    getTotalExits,
  } = useInventory(user?.accessToken ?? null);

  // Handle auth errors from Drive sync
  useEffect(() => {
    if (syncError === 'AUTH_ERROR') {
      signOut();
    }
  }, [syncError, signOut]);

  if (!user) {
    return <LoginScreen />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-10 h-10 text-violet-500" />
        </motion.div>
      </div>
    );
  }

  const handleEntry = (color: ColorType, quantity: number, notes?: string) => {
    addEntry(color, quantity, notes);
    toast.success('Entrada registrada', {
      description: `+${quantity} audífonos ${color}`,
      icon: '📦',
    });
  };

  const handleExit = (items: { color: ColorType; quantity: number }[], notes?: string) => {
    const result = addMultiExit(items, notes);
    if (result.success) {
      const total = items.reduce((a, i) => a + i.quantity, 0);
      toast.success('Venta registrada', {
        description: `${total} audífonos vendidos`,
        icon: '🛒',
      });
    } else {
      toast.error('Error', {
        description: result.error,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        <AppHeader
          rightSlot={
            <UserProfile
              syncStatus={syncStatus}
              lastSyncedAt={lastSyncedAt}
              syncError={syncError}
              onRetry={retrySync}
            />
          }
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Stock Total"
              value={getTotalStock()}
              icon={Package}
              gradient="from-violet-500 to-fuchsia-500"
              glowColor="bg-violet-500"
              suffix="unid."
            />
            <StatsCard
              title="Total Entradas"
              value={getTotalEntries()}
              icon={TrendingUp}
              gradient="from-emerald-500 to-teal-500"
              glowColor="bg-emerald-500"
              suffix="unid."
            />
            <StatsCard
              title="Total Ventas"
              value={getTotalExits()}
              icon={TrendingDown}
              gradient="from-rose-500 to-pink-500"
              glowColor="bg-rose-500"
              suffix="unid."
            />
          </div>

          {/* Inventory Grid */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-400" />
              Inventario por Color
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.keys(inventory.products) as ColorType[]).map((color) => (
                <ColorCard
                  key={color}
                  color={color}
                  quantity={inventory.products[color]}
                />
              ))}
            </div>
          </div>

          {/* Actions & History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Acciones Rápidas
              </h2>
              <EntryForm onSubmit={handleEntry} />
              <ExitForm inventory={inventory.products} onSubmit={handleExit} />
            </div>

            <div>
              <TransactionHistory transactions={inventory.transactions} />
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-gray-500 text-sm">
              Audífonos Pro © 2026 • Gestión de Inventario Inteligente
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
