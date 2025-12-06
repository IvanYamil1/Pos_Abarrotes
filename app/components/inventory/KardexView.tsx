'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Product, InventoryMovement } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiArrowUp, FiArrowDown, FiRefreshCw } from 'react-icons/fi';

interface KardexViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  movements: InventoryMovement[];
}

export function KardexView({ isOpen, onClose, product, movements }: KardexViewProps) {
  if (!product) return null;

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
      case 'devolucion':
        return <FiArrowUp className="text-green-600" />;
      case 'salida':
      case 'venta':
        return <FiArrowDown className="text-red-600" />;
      case 'ajuste':
        return <FiRefreshCw className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getMovementBadge = (type: string) => {
    const labels: Record<string, { label: string; variant: 'success' | 'danger' | 'info' | 'warning' }> = {
      entrada: { label: 'Entrada', variant: 'success' },
      salida: { label: 'Salida', variant: 'danger' },
      venta: { label: 'Venta', variant: 'warning' },
      ajuste: { label: 'Ajuste', variant: 'info' },
      devolucion: { label: 'Devolución', variant: 'success' },
    };
    const config = labels[type] || { label: type, variant: 'info' as const };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Kardex - ${product.name}`} size="xl">
      <div className="space-y-4">
        {/* Product Info */}
        <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Código: {product.barcode}</p>
            <p className="font-medium text-gray-900">{product.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Stock Actual</p>
            <p className={`text-2xl font-bold ${
              product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'
            }`}>
              {product.stock}
            </p>
          </div>
        </div>

        {/* Movements Table */}
        <div className="max-h-96 overflow-y-auto">
          {movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay movimientos registrados
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tipo</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Cantidad</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Stock Ant.</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Stock Nuevo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Referencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.type)}
                        {getMovementBadge(movement.type)}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      movement.type === 'entrada' || movement.type === 'devolucion'
                        ? 'text-green-600'
                        : movement.type === 'salida' || movement.type === 'venta'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      {movement.type === 'entrada' || movement.type === 'devolucion' ? '+' :
                       movement.type === 'salida' || movement.type === 'venta' ? '-' : ''}
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                      {movement.previousStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {movement.newStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {movement.reference || movement.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}
