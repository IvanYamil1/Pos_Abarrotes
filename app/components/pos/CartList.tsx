'use client';

import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { CartItem } from '../../types';

interface CartListProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function CartList({ items, onUpdateQuantity, onRemoveItem }: CartListProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <FiShoppingBag className="w-7 h-7 text-white/30" />
          </div>
          <p className="text-white/50 text-sm font-light mb-1">Carrito vacío</p>
          <p className="text-white/30 text-xs">Escanea o busca productos para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-2 sm:space-y-3">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.isPackage ? 'pkg' : 'unit'}`}
            className="bg-[#2a2a2a] border border-white/10 rounded-lg p-3 sm:p-4
              hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm truncate">
                  {item.product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/50 font-light">
                    ${item.priceUsed.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    {item.product.unit === 'kilo' && '/kg'}
                    {item.product.unit === 'litro' && '/L'}
                  </span>
                  {item.isPackage && (
                    <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-green-400">
                      Paquete
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item.product.id)}
                className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/5 hover:bg-white/10
                    border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300 text-white/60"
                >
                  <FiMinus size={14} />
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      onUpdateQuantity(item.product.id, val);
                    }
                  }}
                  className="w-14 sm:w-16 h-7 sm:h-8 text-center bg-transparent border border-white/20
                    rounded-lg text-white text-sm font-light focus:border-blue-400/70
                    transition-all duration-300 outline-none"
                  step={item.product.unit === 'kilo' || item.product.unit === 'granel' ? '0.1' : '1'}
                  min="0"
                />
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/5 hover:bg-white/10
                    border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300 text-white/60"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {/* Subtotal */}
              <p className="text-base sm:text-lg font-light text-white">
                ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
