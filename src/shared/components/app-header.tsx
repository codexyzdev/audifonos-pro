'use client'

import { motion } from 'framer-motion'
import { Headphones, Sparkles } from 'lucide-react'

interface AppHeaderProps {
  rightSlot?: React.ReactNode
}

export function AppHeader({ rightSlot }: AppHeaderProps) {
  return (
    <header className="border-b border-white/10 backdrop-blur-xl bg-gray-950/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.15 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_30px_rgba(139,92,246,0.5)] shrink-0"
            >
              <Headphones className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">
                Audífonos<span className="text-violet-400">Pro</span>
              </h1>
              <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Sistema de Gestión Inteligente</span>
                <span className="sm:hidden">Gestión de Inventario</span>
              </p>
            </div>
          </div>

          {rightSlot && (
            <div className="flex items-center gap-2">
              {rightSlot}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
