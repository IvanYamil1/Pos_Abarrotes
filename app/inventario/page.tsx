'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { ProductForm } from '../components/inventory/ProductForm';
import { StockAdjustment } from '../components/inventory/StockAdjustment';
import { KardexView } from '../components/inventory/KardexView';
import { useProductStore } from '../stores/productStore';
import { useAuthStore } from '../stores/authStore';
import { Product, ProductCategory, MovementType } from '../types';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiAlertTriangle,
  FiList,
  FiRefreshCw,
} from 'react-icons/fi';

const categories: { value: string; label: string }[] = [
  { value: '', label: 'Todas las categorías' },
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

export default function InventarioPage() {
  const { user } = useAuthStore();
  const { products, addProduct, updateProduct, deleteProduct, updateStock, getMovementsByProduct, getStockAlerts } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  // Modals
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [kardexOpen, setKardexOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode.includes(query)
      );
    }

    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (showLowStock) {
      result = result.filter((p) => p.stock <= p.minStock);
    }

    return result;
  }, [products, searchQuery, categoryFilter, showLowStock]);

  const stockAlerts = getStockAlerts();

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    addProduct(productData);
    toast.success('Producto agregado correctamente');
  };

  const handleUpdateProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedProduct) {
      updateProduct(selectedProduct.id, productData);
      toast.success('Producto actualizado');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`¿Eliminar "${product.name}"?`)) {
      deleteProduct(product.id);
      toast.success('Producto eliminado');
    }
  };

  const handleStockAdjustment = (quantity: number, type: MovementType, reason: string) => {
    if (selectedProduct) {
      updateStock(selectedProduct.id, quantity, type, reason, undefined, user?.id);
      toast.success('Stock actualizado');
    }
  };

  const openEditForm = (product: Product) => {
    setSelectedProduct(product);
    setProductFormOpen(true);
  };

  const openStockAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustmentOpen(true);
  };

  const openKardex = (product: Product) => {
    setSelectedProduct(product);
    setKardexOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      pieza: 'Pieza',
      kilo: 'Kilogramo',
      litro: 'Litro',
      paquete: 'Paquete',
      granel: 'Granel',
    };
    return labels[unit] || unit;
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-500">
              {filteredProducts.length} productos
              {stockAlerts.length > 0 && (
                <span className="text-red-600 ml-2">
                  ({stockAlerts.length} con stock bajo)
                </span>
              )}
            </p>
          </div>
          <Button
            variant="primary"
            icon={<FiPlus />}
            onClick={() => {
              setSelectedProduct(null);
              setProductFormOpen(true);
            }}
          >
            Nuevo Producto
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o código..."
                icon={<FiSearch />}
              />
            </div>
            <div className="w-48">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categories}
              />
            </div>
            <Button
              variant={showLowStock ? 'danger' : 'secondary'}
              icon={<FiAlertTriangle />}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              Stock Bajo ({stockAlerts.length})
            </Button>
          </div>
        </Card>

        {/* Products Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    P. Compra
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    P. Venta
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FiPackage className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              {getUnitLabel(product.unit)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {product.barcode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default" size="sm">
                          {getCategoryLabel(product.category)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        ${product.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ${product.salePrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold ${
                            product.stock <= product.minStock
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock}
                        </span>
                        {product.stock <= product.minStock && (
                          <FiAlertTriangle className="inline ml-1 text-red-500" size={14} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openKardex(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver Kardex"
                          >
                            <FiList size={18} />
                          </button>
                          <button
                            onClick={() => openStockAdjustment(product)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Ajustar Stock"
                          >
                            <FiRefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <ProductForm
        isOpen={productFormOpen}
        onClose={() => {
          setProductFormOpen(false);
          setSelectedProduct(null);
        }}
        onSave={selectedProduct ? handleUpdateProduct : handleAddProduct}
        product={selectedProduct}
      />

      <StockAdjustment
        isOpen={stockAdjustmentOpen}
        onClose={() => {
          setStockAdjustmentOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onConfirm={handleStockAdjustment}
      />

      <KardexView
        isOpen={kardexOpen}
        onClose={() => {
          setKardexOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        movements={selectedProduct ? getMovementsByProduct(selectedProduct.id) : []}
      />
    </MainLayout>
  );
}
