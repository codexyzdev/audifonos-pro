'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ColorType, Transaction, InventoryState } from '@/inventory/types';

const STORAGE_KEY = 'audifonos-inventory-v1';

// Transacciones iniciales - entrada de 500 audífonos (100 de cada color)
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'initial-1', type: 'entrada', color: 'azul', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
  { id: 'initial-2', type: 'entrada', color: 'blanco', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
  { id: 'initial-3', type: 'entrada', color: 'verde', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
  { id: 'initial-4', type: 'entrada', color: 'rosa', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
  { id: 'initial-5', type: 'entrada', color: 'negro', quantity: 100, date: new Date().toISOString(), notes: 'Pedido inicial de China' },
];

const INITIAL_STATE: InventoryState = {
  products: {
    azul: 100,
    blanco: 100,
    verde: 100,
    rosa: 100,
    negro: 100
  },
  transactions: INITIAL_TRANSACTIONS
};

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setInventory(parsed);
      } catch (e) {
        console.error('Error parsing inventory:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cuando cambia el inventario
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    }
  }, [inventory, isLoaded]);

  const addEntry = useCallback((color: ColorType, quantity: number, notes?: string) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'entrada',
      color,
      quantity,
      date: new Date().toISOString(),
      notes
    };

    setInventory(prev => ({
      products: {
        ...prev.products,
        [color]: prev.products[color] + quantity
      },
      transactions: [transaction, ...prev.transactions]
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
      notes
    };

    setInventory(prev => ({
      products: {
        ...prev.products,
        [color]: prev.products[color] - quantity
      },
      transactions: [transaction, ...prev.transactions]
    }));

    return { success: true };
  }, [inventory.products]);

  const addMultiExit = useCallback((items: { color: ColorType; quantity: number }[], notes?: string) => {
    // Verificar stock suficiente
    for (const item of items) {
      if (item.quantity > inventory.products[item.color]) {
        return {
          success: false,
          error: `Stock insuficiente para ${item.color}. Solo hay ${inventory.products[item.color]} unidades disponibles.`
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
      notes
    }));

    setInventory(prev => {
      const newProducts = { ...prev.products };
      items.forEach(item => {
        newProducts[item.color] -= item.quantity;
      });

      return {
        products: newProducts,
        transactions: [...newTransactions, ...prev.transactions]
      };
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
    return inventory.transactions
      .filter(t => t.type === 'entrada')
      .reduce((a, t) => a + t.quantity, 0);
  }, [inventory.transactions]);

  const getTotalExits = useCallback(() => {
    return inventory.transactions
      .filter(t => t.type === 'salida')
      .reduce((a, t) => a + t.quantity, 0);
  }, [inventory.transactions]);

  return {
    inventory,
    isLoaded,
    addEntry,
    addExit,
    addMultiExit,
    resetInventory,
    getTotalStock,
    getTotalEntries,
    getTotalExits
  };
}
