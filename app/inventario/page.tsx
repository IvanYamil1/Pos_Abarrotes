'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { ProductForm } from '../components/inventory/ProductForm';
import { StockAdjustment } from '../components/inventory/StockAdjustment';
import { KardexView } from '../components/inventory/KardexView';
import { useProductStore } from '../stores/productStore';
import { useAuthStore } from '../stores/authStore';
import { Product, MovementType } from '../types';
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
  FiGrid,
  FiX,
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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
      <div style={{ padding: '20px', background: '#030712', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              Inventario
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '14px',
              fontWeight: '300',
              letterSpacing: '0.02em'
            }}>
              {filteredProducts.length} productos
              {stockAlerts.length > 0 && (
                <span style={{ color: 'rgba(239, 68, 68, 0.9)', marginLeft: '8px' }}>
                  ({stockAlerts.length} con stock bajo)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setProductFormOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '2px',
              color: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}
          >
            <FiPlus size={16} />
            Nuevo Producto
          </button>
        </div>

        {/* Filters */}
        <div style={{
          background: '#1d1d1d',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '16px'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o código..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: '#2a2a2a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '300',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '12px 14px',
                background: '#2a2a2a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '300',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '180px'
              }}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} style={{ background: '#2a2a2a' }}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Low Stock Filter */}
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: showLowStock ? 'rgba(239, 68, 68, 0.1)' : '#2a2a2a',
                border: '1px solid',
                borderColor: showLowStock ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                color: showLowStock ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '12px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.3s ease'
              }}
            >
              <FiAlertTriangle size={14} />
              Stock Bajo ({stockAlerts.length})
            </button>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '10px',
                  background: viewMode === 'table' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: viewMode === 'table' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  color: viewMode === 'table' ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiList size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '10px',
                  background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  color: viewMode === 'grid' ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        {viewMode === 'table' ? (
          /* Table View */
          <div style={{
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {['Producto', 'Código', 'Categoría', 'P. Compra', 'P. Venta', 'Stock', 'Acciones'].map((header, i) => (
                      <th
                        key={header}
                        style={{
                          padding: '14px 16px',
                          textAlign: i >= 3 ? 'right' : 'left',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: 'rgba(255, 255, 255, 0.5)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          background: '#2a2a2a'
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.3)'
                      }}>
                        <FiPackage size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p style={{ fontSize: '13px', fontWeight: '300' }}>No se encontraron productos</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#2a2a2a',
                              borderRadius: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }}
                                />
                              ) : (
                                <FiPackage style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                              )}
                            </div>
                            <div>
                              <p style={{ fontWeight: '400', color: 'white', fontSize: '13px', marginBottom: '2px' }}>
                                {product.name}
                              </p>
                              <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                                {getUnitLabel(product.unit)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '12px',
                            background: '#2a2a2a',
                            padding: '4px 8px',
                            borderRadius: '2px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontFamily: 'monospace'
                          }}>
                            {product.barcode}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '10px',
                            padding: '4px 10px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '2px',
                            color: '#3b82f6',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {getCategoryLabel(product.category)}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
                          ${product.purchasePrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: 'white', fontSize: '13px', fontWeight: '400' }}>
                          ${product.salePrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <span style={{
                            fontWeight: '400',
                            color: product.stock <= product.minStock ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'
                          }}>
                            {product.stock}
                          </span>
                          {product.stock <= product.minStock && (
                            <FiAlertTriangle style={{ marginLeft: '6px', color: 'rgba(239, 68, 68, 0.8)' }} size={12} />
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                              onClick={() => openKardex(product)}
                              title="Ver Kardex"
                              style={{
                                padding: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '2px',
                                color: 'rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                e.currentTarget.style.color = '#3b82f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                              }}
                            >
                              <FiList size={16} />
                            </button>
                            <button
                              onClick={() => openStockAdjustment(product)}
                              title="Ajustar Stock"
                              style={{
                                padding: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '2px',
                                color: 'rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                                e.currentTarget.style.color = '#10b981';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                              }}
                            >
                              <FiRefreshCw size={16} />
                            </button>
                            <button
                              onClick={() => openEditForm(product)}
                              title="Editar"
                              style={{
                                padding: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '2px',
                                color: 'rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                e.currentTarget.style.color = '#3b82f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                              }}
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              title="Eliminar"
                              style={{
                                padding: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '2px',
                                color: 'rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                              }}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {filteredProducts.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(255, 255, 255, 0.3)',
                background: '#1d1d1d',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2px'
              }}>
                <FiPackage size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px', fontWeight: '300' }}>No se encontraron productos</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: '#1d1d1d',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    padding: '20px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  {/* Product Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#2a2a2a',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }}
                        />
                      ) : (
                        <FiPackage style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '20px' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: '400',
                        color: 'white',
                        fontSize: '14px',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '6px' }}>
                        {getUnitLabel(product.unit)}
                      </p>
                      <span style={{
                        fontSize: '9px',
                        padding: '3px 8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '2px',
                        color: '#3b82f6',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Código
                    </span>
                    <p style={{
                      fontSize: '12px',
                      background: '#2a2a2a',
                      padding: '6px 10px',
                      borderRadius: '2px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'monospace',
                      marginTop: '4px'
                    }}>
                      {product.barcode}
                    </p>
                  </div>

                  {/* Prices */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Compra
                      </span>
                      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '300', marginTop: '4px' }}>
                        ${product.purchasePrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Venta
                      </span>
                      <p style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '300', marginTop: '4px' }}>
                        ${product.salePrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Stock
                      </span>
                      <p style={{
                        fontSize: '14px',
                        color: product.stock <= product.minStock ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                        fontWeight: '400',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {product.stock}
                        {product.stock <= product.minStock && <FiAlertTriangle size={12} />}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <button
                      onClick={() => openKardex(product)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#2a2a2a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FiList size={14} />
                    </button>
                    <button
                      onClick={() => openStockAdjustment(product)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '2px',
                        color: '#10b981',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiRefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => openEditForm(product)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '2px',
                        color: '#3b82f6',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '2px',
                        color: '#ef4444',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
