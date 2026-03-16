'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
  suffix?: string;
}

export function StatsCard({ title, value, icon: Icon, gradient, glowColor, suffix = '' }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      style={{ willChange: 'transform' }}
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br from-gray-900 to-gray-800
        border border-white/10
        shadow-[0_0_40px_rgba(0,0,0,0.3)]
      `}
    >
      {/* Glow effect */}
      <div 
        className={`
          absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20
          ${glowColor}
        `}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-black text-white">
            {value}
            <span className="text-lg text-gray-500 ml-1">{suffix}</span>
          </p>
        </div>
        
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center
          bg-gradient-to-br ${gradient}
          shadow-lg
        `}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
