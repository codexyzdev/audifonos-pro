'use client';

import { motion } from 'framer-motion';
import { COLOR_CONFIG } from '@/inventory/types';
import type { Transaction } from '@/inventory/types';
import { ArrowDownLeft, ArrowUpRight, Package, Clock } from 'lucide-react';
import { useState } from 'react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'entrada' | 'salida'>('all');

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <div className="p-5 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-400" />
            Historial de Movimientos
          </h3>
          
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'all' ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('entrada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'entrada' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilter('salida')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === 'salida' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Salidas
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                className="p-3 hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === 'entrada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {transaction.type === 'entrada' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${transaction.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {transaction.type === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${COLOR_CONFIG[transaction.color].gradient}`} />
                        <span className="text-white text-sm capitalize">{COLOR_CONFIG[transaction.color].name}</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs">{formatDate(transaction.date)}</p>
                    {transaction.notes && (
                      <p className="text-gray-600 text-xs mt-0.5">{transaction.notes}</p>
                    )}
                  </div>
                </div>

                <div className={`text-base font-bold ${transaction.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {transaction.type === 'entrada' ? '+' : '-'}{transaction.quantity}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
