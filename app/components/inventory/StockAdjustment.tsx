'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Product, MovementType } from '../../types';
import { useThemeStore } from '../../stores/themeStore';
import { FiPlus, FiMinus, FiRefreshCw, FiCheck, FiPackage, FiAlertTriangle } from 'react-icons/fi';

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
  const { colors } = useThemeStore();
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
    { value: 'entrada', label: 'Entrada', icon: FiPlus, color: colors.success },
    { value: 'salida', label: 'Salida', icon: FiMinus, color: colors.error },
    { value: 'ajuste', label: 'Ajuste', icon: FiRefreshCw, color: colors.accent },
    { value: 'devolucion', label: 'Devolución', icon: FiPlus, color: colors.warning },
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

  const getUnitLabel = () => {
    switch (product.unit) {
      case 'kilo': return 'kg';
      case 'litro': return 'L';
      default: return 'unidades';
    }
  };

  const newStock = getNewStock();
  const isLowStock = newStock <= product.minStock;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar Inventario" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Product Info */}
        <div style={{
          padding: '16px',
          background: colors.bgTertiary,
          borderRadius: '2px',
          border: `1px solid ${colors.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: colors.accentBg,
            border: `1px solid ${colors.accentBorder}`,
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FiPackage size={24} style={{ color: colors.accent }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {product.name}
            </h3>
            <p style={{
              fontSize: '12px',
              color: colors.textMuted,
              marginBottom: '8px'
            }}>
              Código: {product.barcode}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: colors.accentBg,
              border: `1px solid ${colors.accentBorder}`,
              borderRadius: '2px'
            }}>
              <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Stock actual:
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.accent }}>
                {product.stock} {getUnitLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* Movement Type */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: colors.textMuted,
            marginBottom: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            Tipo de Movimiento
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}>
            {movementTypes.map((type) => {
              const isSelected = movementType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setMovementType(type.value as MovementType)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '2px',
                    border: `1px solid ${isSelected ? type.color : colors.borderColor}`,
                    background: isSelected ? `${type.color}15` : colors.bgTertiary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = colors.borderHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = colors.borderColor;
                    }
                  }}
                >
                  <type.icon
                    size={18}
                    style={{ color: isSelected ? type.color : colors.textMuted }}
                  />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: isSelected ? type.color : colors.textSecondary
                  }}>
                    {type.label}
                  </span>
                </button>
              );
            })}
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
            value=""
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe la razón..."
          />
        )}

        {/* Preview */}
        {quantity && parseFloat(quantity) > 0 && (
          <div style={{
            padding: '16px',
            background: isLowStock ? colors.warningBg : colors.successBg,
            border: `1px solid ${isLowStock ? colors.warningBorder : colors.successBorder}`,
            borderRadius: '2px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '13px',
                color: colors.textSecondary
              }}>
                Stock resultante:
              </span>
              <span style={{
                fontSize: '24px',
                fontWeight: '300',
                color: isLowStock ? colors.warning : colors.success,
                letterSpacing: '-0.02em'
              }}>
                {newStock} {getUnitLabel()}
              </span>
            </div>
            {isLowStock && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: `1px solid ${colors.warningBorder}`
              }}>
                <FiAlertTriangle size={16} style={{ color: colors.warning }} />
                <span style={{
                  fontSize: '12px',
                  color: colors.warning
                }}>
                  El stock quedará por debajo del mínimo ({product.minStock})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '8px',
          borderTop: `1px solid ${colors.borderColor}`
        }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            style={{ flex: 1 }}
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
