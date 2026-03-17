export type ColorType = 'azul' | 'blanco' | 'verde' | 'rosa' | 'negro';

export interface Transaction {
  id: string;
  type: 'entrada' | 'salida';
  color: ColorType;
  quantity: number;
  date: string;
  notes?: string;
}

export interface InventoryState {
  products: Record<ColorType, number>;
  transactions: Transaction[];
}

export const COLOR_CONFIG: Record<ColorType, { name: string; gradient: string; hex: string; glow: string; textShadow?: string }> = {
  azul: {
    name: 'Azul',
    gradient: 'from-blue-500 to-cyan-400',
    hex: '#3B82F6',
    glow: 'shadow-blue-500/50'
  },
  blanco: {
    name: 'Blanco',
    gradient: 'from-slate-100 to-white',
    hex: '#F8FAFC',
    glow: 'shadow-white/50'
  },
  verde: {
    name: 'Verde',
    gradient: 'from-emerald-500 to-green-400',
    hex: '#10B981',
    glow: 'shadow-emerald-500/50'
  },
  rosa: {
    name: 'Rosa',
    gradient: 'from-pink-500 to-rose-400',
    hex: '#EC4899',
    glow: 'shadow-pink-500/50'
  },
  negro: {
    name: 'Negro',
    gradient: 'from-gray-800 to-black',
    hex: '#1F2937',
    glow: 'shadow-gray-500/50',
    textShadow: '[-webkit-text-stroke:1.5px_rgba(255,255,255,0.7)]'
  }
};
