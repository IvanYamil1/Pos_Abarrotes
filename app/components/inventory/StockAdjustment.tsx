'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Product, MovementType } from '../../types';
import { FiPlus, FiMinus, FiRefreshCw, FiCheck } from 'react-icons/fi';

interface StockAdjustmentProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (quantity: number, type: MovementType, reason: string) => void;
}

export function StockAdjustment({
  isOpen,
  onClose,
  product,
  onConfirm,
}: StockAdjustmentProps) {
  const [movementType, setMovementType] = useState<MovementType>('entrada');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    const qty = parseFloat(quantity);
    if (!isNaN(qty) && qty > 0 && reason.trim()) {
      onConfirm(qty, movementType, reason.trim());
      setQuantity('');
      setReason('');
      onClose();
    }
  };

  if (!product) return null;

  const getNewStock = () => {
    const qty = parseFloat(quantity) || 0;
    switch (movementType) {
      case 'entrada':
      case 'devolucion':
        return product.stock + qty;
      case 'salida':
        return Math.max(0, product.stock - qty);
      case 'ajuste':
        return qty;
      default:
        return product.stock;
    }
  };

  const movementTypes = [
    { value: 'entrada', label: 'Entrada de Inventario', icon: FiPlus },
    { value: 'salida', label: 'Salida de Inventario', icon: FiMinus },
    { value: 'ajuste', label: 'Ajuste de Stock', icon: FiRefreshCw },
    { value: 'devolucion', label: 'Devolución', icon: FiPlus },
  ];

  const reasonOptions = [
    { value: '', label: 'Seleccionar razón...' },
    { value: 'Compra de mercancía', label: 'Compra de mercancía' },
    { value: 'Merma/Caducidad', label: 'Merma/Caducidad' },
    { value: 'Robo/Pérdida', label: 'Robo/Pérdida' },
    { value: 'Error en inventario', label: 'Error en inventario' },
    { value: 'Devolución de cliente', label: 'Devolución de cliente' },
    { value: 'Consumo interno', label: 'Consumo interno' },
    { value: 'Otro', label: 'Otro' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar Inventario" size="md">
      <div className="space-y-4">
        {/* Product Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500">Código: {product.barcode}</p>
          <p className="text-lg font-bold text-blue-600 mt-2">
            Stock actual: {product.stock} {product.unit === 'kilo' ? 'kg' : product.unit === 'litro' ? 'L' : 'unidades'}
          </p>
        </div>

        {/* Movement Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Movimiento
          </label>
          <div className="grid grid-cols-2 gap-2">
            {movementTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setMovementType(type.value as MovementType)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  movementType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <type.icon
                  className={`w-5 h-5 ${
                    movementType === type.value ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    movementType === type.value ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <Input
          label={movementType === 'ajuste' ? 'Nuevo Stock' : 'Cantidad'}
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={movementType === 'ajuste' ? 'Nuevo valor de stock' : 'Cantidad a mover'}
          step={product.unit === 'kilo' || product.unit === 'granel' ? '0.01' : '1'}
          min="0"
        />

        {/* Reason */}
        <Select
          label="Razón del Movimiento"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={reasonOptions}
        />

        {reason === 'Otro' && (
          <Input
            label="Especificar razón"
            value={reason === 'Otro' ? '' : reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe la razón..."
          />
        )}

        {/* Preview */}
        {quantity && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock resultante:</span>
              <span className={`text-xl font-bold ${
                getNewStock() <= product.minStock ? 'text-red-600' : 'text-green-600'
              }`}>
                {getNewStock()} {product.unit === 'kilo' ? 'kg' : product.unit === 'litro' ? 'L' : 'unidades'}
              </span>
            </div>
            {getNewStock() <= product.minStock && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ El stock quedará por debajo del mínimo ({product.minStock})
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="flex-1"
            icon={<FiCheck />}
            disabled={!quantity || parseFloat(quantity) <= 0 || !reason.trim()}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
