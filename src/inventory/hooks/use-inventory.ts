'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ColorType, Transaction, InventoryState } from '@/inventory/types';
import type { SyncStatus } from '@/types/auth';
import { loadInventory, saveInventory, INITIAL_STATE } from '@/services/driveService';

export function useInventory(accessToken: string | null) {
  const [inventory, setInventory] = useState<InventoryState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('sincronizado');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<InventoryState | null>(null);

  // Load inventory from Drive on mount / when accessToken becomes available
  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function load() {
      const result = await loadInventory(accessToken!);
      if (cancelled) return;

      if (result.data) {
        setInventory(result.data);
        setSyncError(result.error);
      } else {
        setInventory(INITIAL_STATE);
        setSyncError(result.error);
        setSyncStatus('error');
      }
      setIsLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [accessToken]);

  // Debounced Drive save
  const triggerSave = useCallback((state: InventoryState) => {
    if (!accessToken) return;

    pendingStateRef.current = state;
    setSyncStatus('sincronizando');
    setSyncError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const stateToSave = pendingStateRef.current;
      if (!stateToSave || !accessToken) return;

      const result = await saveInventory(accessToken, stateToSave);

      if (result.error) {
        setSyncStatus('error');
        setSyncError(result.error);
      } else {
        setSyncStatus('sincronizado');
        setLastSyncedAt(new Date());
        setSyncError(null);
      }
    }, 500);
  }, [accessToken]);

  // Trigger save whenever inventory changes (only after initial load)
  useEffect(() => {
    if (!isLoaded || !accessToken) return;
    triggerSave(inventory);
  }, [inventory, isLoaded, accessToken, triggerSave]);

  const retrySync = useCallback(() => {
    triggerSave(inventory);
  }, [inventory, triggerSave]);

  const addEntry = useCallback((color: ColorType, quantity: number, notes?: string) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'entrada',
      color,
      quantity,
      date: new Date().toISOString(),
      notes,
    };
    setInventory(prev => ({
      products: { ...prev.products, [color]: prev.products[color] + quantity },
      transactions: [transaction, ...prev.transactions],
    }));
  }, []);

  const addExit = useCallback((color: ColorType, quantity: number, notes?: string) => {
    const currentStock = inventory.products[color];
    if (quantity > currentStock) {
      return { success: false, error: `Stock insuficiente. Solo hay ${currentStock} unidades disponibles.` };
    }
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'salida',
      color,
      quantity,
      date: new Date().toISOString(),
      notes,
    };
    setInventory(prev => ({
      products: { ...prev.products, [color]: prev.products[color] - quantity },
      transactions: [transaction, ...prev.transactions],
    }));
    return { success: true };
  }, [inventory.products]);

  const addMultiExit = useCallback((items: { color: ColorType; quantity: number }[], notes?: string) => {
    for (const item of items) {
      if (item.quantity > inventory.products[item.color]) {
        return {
          success: false,
          error: `Stock insuficiente para ${item.color}. Solo hay ${inventory.products[item.color]} unidades disponibles.`,
        };
      }
    }
    const timestamp = Date.now().toString();
    const newTransactions: Transaction[] = items.map((item, index) => ({
      id: `${timestamp}-${index}`,
      type: 'salida',
      color: item.color,
      quantity: item.quantity,
      date: new Date().toISOString(),
      notes,
    }));
    setInventory(prev => {
      const newProducts = { ...prev.products };
      items.forEach(item => { newProducts[item.color] -= item.quantity; });
      return { products: newProducts, transactions: [...newTransactions, ...prev.transactions] };
    });
    return { success: true };
  }, [inventory.products]);

  const resetInventory = useCallback(() => {
    setInventory(INITIAL_STATE);
  }, []);

  const getTotalStock = useCallback(() => {
    return Object.values(inventory.products).reduce((a, b) => a + b, 0);
  }, [inventory.products]);

  const getTotalEntries = useCallback(() => {
    return inventory.transactions.filter(t => t.type === 'entrada').reduce((a, t) => a + t.quantity, 0);
  }, [inventory.transactions]);

  const getTotalExits = useCallback(() => {
    return inventory.transactions.filter(t => t.type === 'salida').reduce((a, t) => a + t.quantity, 0);
  }, [inventory.transactions]);

  return {
    inventory,
    isLoaded,
    syncStatus,
    lastSyncedAt,
    syncError,
    retrySync,
    addEntry,
    addExit,
    addMultiExit,
    resetInventory,
    getTotalStock,
    getTotalEntries,
    getTotalExits,
  };
}
