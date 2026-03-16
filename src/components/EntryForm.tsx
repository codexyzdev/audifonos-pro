import { useState } from 'react';
import { motion } from 'framer-motion';
import { COLOR_CONFIG } from '@/types';
import type { ColorType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, PackagePlus, X } from 'lucide-react';

interface EntryFormProps {
  onSubmit: (color: ColorType, quantity: number, notes?: string) => void;
}

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColor && quantity && parseInt(quantity) > 0) {
      onSubmit(selectedColor, parseInt(quantity), notes || undefined);
      setQuantity('');
      setNotes('');
      setSelectedColor(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isOpen ? (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsOpen(true)}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all duration-200 flex items-center justify-center gap-3"
        >
          <PackagePlus className="w-6 h-6" />
          Registrar Entrada
        </motion.button>
      ) : (
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-400" />
              Nueva Entrada
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <Label className="text-gray-300 mb-2 block text-sm">Selecciona el Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(COLOR_CONFIG) as ColorType[]).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`p-2 rounded-xl border-2 transition-all duration-150 ${selectedColor === color ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-transparent hover:border-white/20'}`}
                >
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${COLOR_CONFIG[color].gradient} ${color === 'blanco' ? 'border border-gray-600' : ''}`} />
                  <p className="text-xs text-gray-400 mt-1 capitalize">{COLOR_CONFIG[color].name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="entry-quantity" className="text-gray-300 mb-1 block text-sm">Cantidad</Label>
            <Input
              id="entry-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ej: 50"
              className="bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-gray-500"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="entry-notes" className="text-gray-300 mb-1 block text-sm">Notas (opcional)</Label>
            <Input
              id="entry-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Pedido de China #1234"
              className="bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-gray-500"
            />
          </div>

          <Button
            type="submit"
            disabled={!selectedColor || !quantity || parseInt(quantity) <= 0}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar al Inventario
          </Button>
        </motion.form>
      )}
    </div>
  );
}
