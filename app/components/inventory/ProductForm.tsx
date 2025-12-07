'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Product, ProductCategory, UnitType } from '../../types';
import { FiSave, FiX, FiPackage, FiDollarSign } from 'react-icons/fi';
import { useThemeStore } from '../../stores/themeStore';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product?: Product | null;
}

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'abarrotes', label: 'Abarrotes' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'carnes', label: 'Carnes' },
  { value: 'frutas_verduras', label: 'Frutas y Verduras' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'higiene', label: 'Higiene Personal' },
  { value: 'dulces', label: 'Dulces' },
  { value: 'botanas', label: 'Botanas' },
  { value: 'panaderia', label: 'Panadería' },
  { value: 'otros', label: 'Otros' },
];

const units: { value: UnitType; label: string }[] = [
  { value: 'pieza', label: 'Pieza' },
  { value: 'kilo', label: 'Kilogramo' },
  { value: 'litro', label: 'Litro' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'granel', label: 'Granel' },
];

export function ProductForm({ isOpen, onClose, onSave, product }: ProductFormProps) {
  const { colors } = useThemeStore();
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    category: 'abarrotes' as ProductCategory,
    unit: 'pieza' as UnitType,
    purchasePrice: '',
    salePrice: '',
    packagePrice: '',
    packageQuantity: '',
    stock: '',
    minStock: '',
    image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode,
        name: product.name,
        description: product.description || '',
        category: product.category,
        unit: product.unit,
        purchasePrice: product.purchasePrice.toString(),
        salePrice: product.salePrice.toString(),
        packagePrice: product.packagePrice?.toString() || '',
        packageQuantity: product.packageQuantity?.toString() || '',
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        image: product.image || '',
      });
    } else {
      setFormData({
        barcode: '',
        name: '',
        description: '',
        category: 'abarrotes',
        unit: 'pieza',
        purchasePrice: '',
        salePrice: '',
        packagePrice: '',
        packageQuantity: '',
        stock: '',
        minStock: '5',
        image: '',
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'El código de barras es requerido';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = 'Precio de compra inválido';
    }
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      newErrors.salePrice = 'Precio de venta inválido';
    }
    if (parseFloat(formData.salePrice) < parseFloat(formData.purchasePrice)) {
      newErrors.salePrice = 'El precio de venta debe ser mayor al de compra';
    }
    if (!formData.stock || parseFloat(formData.stock) < 0) {
      newErrors.stock = 'Stock inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      barcode: formData.barcode.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      unit: formData.unit,
      purchasePrice: parseFloat(formData.purchasePrice),
      salePrice: parseFloat(formData.salePrice),
      packagePrice: formData.packagePrice ? parseFloat(formData.packagePrice) : undefined,
      packageQuantity: formData.packageQuantity ? parseInt(formData.packageQuantity) : undefined,
      stock: parseFloat(formData.stock),
      minStock: parseFloat(formData.minStock) || 5,
      image: formData.image.trim() || undefined,
      isActive: true,
    };

    onSave(productData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Código de Barras"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            error={errors.barcode}
            placeholder="7501000111111"
          />
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Coca-Cola 600ml"
          />
        </div>

        <Input
          label="Descripción (opcional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción del producto"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Select
            label="Categoría"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
            options={categories}
          />
          <Select
            label="Unidad de Medida"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
            options={units}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Precio de Compra"
            type="number"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
            error={errors.purchasePrice}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          <Input
            label="Precio de Venta"
            type="number"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
            error={errors.salePrice}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        {/* Package Section */}
        <div style={{
          padding: '16px',
          background: colors.bgTertiary,
          borderRadius: '8px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FiPackage style={{ color: colors.accent, fontSize: '16px' }} />
            <span style={{
              fontSize: '13px',
              fontWeight: '500',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Precio por Paquete (opcional)
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Precio del Paquete"
              type="number"
              value={formData.packagePrice}
              onChange={(e) => setFormData({ ...formData, packagePrice: e.target.value })}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <Input
              label="Piezas por Paquete"
              type="number"
              value={formData.packageQuantity}
              onChange={(e) => setFormData({ ...formData, packageQuantity: e.target.value })}
              placeholder="12"
              step="1"
              min="1"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Stock Inicial"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            error={errors.stock}
            placeholder="0"
            step={formData.unit === 'kilo' || formData.unit === 'granel' ? '0.01' : '1'}
            min="0"
          />
          <Input
            label="Stock Mínimo (alerta)"
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
            placeholder="5"
            step="1"
            min="0"
          />
        </div>

        <Input
          label="URL de Imagen (opcional)"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://ejemplo.com/imagen.jpg"
        />

        {/* Margin Preview */}
        {formData.purchasePrice && formData.salePrice && parseFloat(formData.purchasePrice) > 0 && (
          <div style={{
            padding: '16px',
            background: colors.successBg,
            borderRadius: '8px',
            border: `1px solid ${colors.successBorder}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiDollarSign style={{ color: colors.success, fontSize: '16px' }} />
              <span style={{
                fontSize: '13px',
                fontWeight: '500',
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Margen de Ganancia
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>Ganancia por unidad:</span>
              <span style={{ fontSize: '18px', fontWeight: '600', color: colors.success }}>
                ${(parseFloat(formData.salePrice) - parseFloat(formData.purchasePrice)).toFixed(2)}
                <span style={{ fontSize: '14px', fontWeight: '400', marginLeft: '8px', opacity: 0.8 }}>
                  ({(((parseFloat(formData.salePrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(1)}%)
                </span>
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }} icon={<FiX />}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" style={{ flex: 1 }} icon={<FiSave />}>
            {product ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
