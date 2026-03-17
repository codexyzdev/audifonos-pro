'use client';

import { motion } from 'framer-motion';
import { Headphones, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedBackground } from '@/shared/components/animated-background';

export function LoginScreen() {
  const { signIn, isLoading, isRestoring, error } = useAuth();

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-4 border-violet-500/30 border-t-violet-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-xl p-10 flex flex-col items-center gap-6 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.15 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_40px_rgba(139,92,246,0.5)]"
            >
              <Headphones className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Audífonos<span className="text-violet-400">Pro</span>
              </h1>
              <p className="text-gray-400 text-xs flex items-center justify-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Sistema de Gestión Inteligente
              </p>
            </div>
          </div>

          <p className="text-gray-400 text-sm text-center">
            Inicia sesión con tu cuenta de Google para acceder al inventario.
          </p>

          {/* Google button */}
          <button
            onClick={signIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl border border-white/10 bg-gray-800/50 hover:bg-gray-700/50 hover:border-white/20 transition-all duration-150 text-gray-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión con Google'}
          </button>

          {error && (
            <p className="w-full text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
