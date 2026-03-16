'use client'

import { motion } from 'framer-motion'
import { Headphones, RotateCcw, Sparkles } from 'lucide-react'

interface AppHeaderProps {
  onReset: () => void
}

export function AppHeader({ onReset }: AppHeaderProps) {
  const handleReset = () => {
    if (confirm('¿Estás seguro de reiniciar el inventario? Se perderán todos los datos.')) {
      onReset()
    }
  }

  return (
    <header className="border-b border-white/10 backdrop-blur-xl bg-gray-950/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.15 }}
              className="
                w-10 h-10 rounded-xl flex items-center justify-center
                bg-gradient-to-br from-violet-500 to-fuchsia-500
                shadow-[0_0_30px_rgba(139,92,246,0.5)]
              "
            >
              <Headphones className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Audífonos<span className="text-violet-400">Pro</span>
              </h1>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Sistema de Gestión Inteligente
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="
              p-2.5 rounded-xl
              bg-gray-800/50 hover:bg-gray-700/50
              text-gray-400 hover:text-white
              border border-white/10 hover:border-white/20
              transition-all duration-150
              flex items-center gap-2
            "
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Reiniciar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
