'use client';

import { motion } from 'framer-motion';
import { COLOR_CONFIG } from '@/inventory/types';
import type { ColorType } from '@/inventory/types';
import { Headphones } from 'lucide-react';

interface ColorCardProps {
  color: ColorType;
  quantity: number;
  maxQuantity?: number;
}

export function ColorCard({ color, quantity, maxQuantity = 100 }: ColorCardProps) {
  const config = COLOR_CONFIG[color];
  const percentage = (quantity / maxQuantity) * 100;
  const isLowStock = quantity < 20;
  const isOutOfStock = quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02, y: -3 }}
      style={{ willChange: 'transform' }}
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br from-gray-900 to-gray-800
        border border-white/10
        shadow-[0_0_40px_rgba(0,0,0,0.3)]
        ${isOutOfStock ? 'opacity-60' : ''}
      `}
    >
      {/* Glow effect */}
      <div 
        className={`
          absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30
          bg-gradient-to-br ${config.gradient}
        `}
      />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${config.gradient}
              shadow-lg ${config.glow}
            `}
          >
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base capitalize">{config.name}</h3>
            <p className="text-gray-400 text-xs">Audífonos</p>
          </div>
        </div>
        
        {/* Stock indicator */}
        {isLowStock && !isOutOfStock && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Bajo
          </span>
        )}
        {isOutOfStock && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            Agotado
          </span>
        )}
      </div>

      {/* Quantity */}
      <div className="relative">
        <div className="flex items-baseline gap-2">
          <span className={`
            text-4xl font-black tracking-tight
            bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent
            ${config.textShadow ?? ''} [-webkit-text-stroke:1px_rgba(255,255,255,0.4)]
          `}>
            {quantity}
          </span>
          <span className="text-gray-500 text-xs">/ {maxQuantity}</span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`
              h-full rounded-full bg-gradient-to-r ${config.gradient}
              ${isLowStock ? 'animate-pulse' : ''}
            `}
          />
        </div>
        
        <p className="mt-1 text-gray-400 text-xs">
          {percentage.toFixed(0)}% disponible
        </p>
      </div>
    </motion.div>
  );
}
