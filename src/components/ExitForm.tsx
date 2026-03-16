import { useState } from 'react';
import { motion } from 'framer-motion';
import { COLOR_CONFIG } from '@/types';
import type { ColorType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, X, Check, Plus } from 'lucide-react';

interface ExitFormProps {
  inventory: Record<ColorType, number>;
  onSubmit: (items: { color: ColorType; quantity: number }[], notes?: string) => void;
}

interface SaleItem {
  color: ColorType;
  quantity: number;
}

export function ExitForm({ inventory, onSubmit }: ExitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const addItem = () => {
    if (!selectedColor || !quantity || parseInt(quantity) <= 0) return;
    
    const qty = parseInt(quantity);
    const existingItem = items.find(i => i.color === selectedColor);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty + qty > inventory[selectedColor]) {
      setError(`Stock insuficiente. Disponible: ${inventory[selectedColor] - currentQty}`);
      return;
    }

    setError('');
    
    if (existingItem) {
      setItems(items.map(i => 
        i.color === selectedColor 
          ? { ...i, quantity: i.quantity + qty }
          : i
      ));
    } else {
      setItems([...items, { color: selectedColor, quantity: qty }]);
    }
    
    setQuantity('');
    setSelectedColor(null);
  };

  const removeItem = (color: ColorType) => {
    setItems(items.filter(i => i.color !== color));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    onSubmit(items, notes || undefined);
    setItems([]);
    setNotes('');
    setIsOpen(false);
  };

  const getTotalItems = () => items.reduce((a, i) => a + i.quantity, 0);

  return (
    <div className="space-y-4">
      {!isOpen ? (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsOpen(true)}
          className="
            w-full py-5 rounded-2xl
            bg-gradient-to-r from-rose-500 to-pink-500
            hover:from-rose-400 hover:to-pink-400
            text-white font-bold text-lg
            shadow-[0_0_30px_rgba(244,63,94,0.4)]
            hover:shadow-[0_0_40px_rgba(244,63,94,0.6)]
            transition-all duration-200
            flex items-center justify-center gap-3
          "
        >
          <ShoppingCart className="w-6 h-6" />
          Registrar Venta / Salida
        </motion.button>
      ) : (
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          onSubmit={handleSubmit}
          className="
            p-5 rounded-2xl
            bg-gradient-to-br from-gray-900/90 to-gray-800/90
            backdrop-blur-xl border border-rose-500/30
            shadow-[0_0_40px_rgba(244,63,94,0.2)]
          "
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-rose-400" />
              Nueva Venta
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Items Section */}
          <div className="mb-4 p-3 rounded-xl bg-gray-800/50">
            <Label className="text-gray-300 mb-2 block text-sm">Agregar Productos</Label>
            
            {/* Color Selection */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {(Object.keys(COLOR_CONFIG) as ColorType[]).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  disabled={inventory[color] === 0}
                  className={`
                    p-2 rounded-xl border-2 transition-all duration-150
                    ${selectedColor === color 
                      ? `border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]` 
                      : 'border-transparent hover:border-white/20'
                    }
                    ${inventory[color] === 0 ? 'opacity-30 cursor-not-allowed' : ''}
                  `}
                >
                  <div 
                    className={`
                      w-full aspect-square rounded-lg
                      bg-gradient-to-br ${COLOR_CONFIG[color].gradient}
                      ${color === 'blanco' ? 'border border-gray-600' : ''}
                    `}
                  />
                  <p className="text-xs text-gray-400 mt-1">{inventory[color]}</p>
                </button>
              ))}
            </div>

            {/* Quantity Input */}
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max={selectedColor ? inventory[selectedColor] : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Cantidad"
                className="
                  flex-1 bg-gray-700/50 border-gray-600 text-white
                  focus:border-rose-500 focus:ring-rose-500/20
                  placeholder:text-gray-500
                "
              />
              <Button
                type="button"
                onClick={addItem}
                disabled={!selectedColor || !quantity}
                className="bg-rose-500 hover:bg-rose-400 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {error && (
              <p className="mt-2 text-rose-400 text-sm">{error}</p>
            )}
          </div>

          {/* Selected Items */}
          {items.length > 0 && (
            <div className="mb-4">
              <Label className="text-gray-300 mb-2 block text-sm">Productos en esta venta:</Label>
              <div className="space-y-2">
                {items.map((item) => (
                  <motion.div
                    key={item.color}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="
                      flex items-center justify-between p-2 rounded-xl
                      bg-gradient-to-r from-gray-800 to-gray-700/50
                    "
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={`
                          w-6 h-6 rounded-lg
                          bg-gradient-to-br ${COLOR_CONFIG[item.color].gradient}
                        `}
                      />
                      <span className="text-white font-medium text-sm capitalize">
                        {COLOR_CONFIG[item.color].name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold text-sm">{item.quantity} unid.</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.color)}
                        className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <p className="text-rose-400 font-bold text-center text-sm">
                  Total: {getTotalItems()} audífonos
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-4">
            <Label htmlFor="exit-notes" className="text-gray-300 mb-1 block text-sm">Notas (opcional)</Label>
            <Input
              id="exit-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Venta a cliente Juan Pérez"
              className="
                bg-gray-800/50 border-gray-700 text-white
                focus:border-rose-500 focus:ring-rose-500/20
                placeholder:text-gray-500
              "
            />
          </div>

          <Button
            type="submit"
            disabled={items.length === 0}
            className="
              w-full py-5
              bg-gradient-to-r from-rose-500 to-pink-500
              hover:from-rose-400 hover:to-pink-400
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-bold
              shadow-[0_0_20px_rgba(244,63,94,0.3)]
            "
          >
            <Check className="w-5 h-5 mr-2" />
            Confirmar Venta
          </Button>
        </motion.form>
      )}
    </div>
  );
}
