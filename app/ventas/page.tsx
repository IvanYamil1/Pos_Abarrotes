'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useSalesStore } from '../stores/salesStore';
import { useProductStore } from '../stores/productStore';
import { useCashRegisterStore } from '../stores/cashRegisterStore';
import { useStoreConfigStore } from '../stores/storeConfig';
import { useAuthStore } from '../stores/authStore';
import { Product, Sale, PaymentMethod } from '../types';
import toast from 'react-hot-toast';
import {
  FiTrash2,
  FiDollarSign,
  FiAlertCircle,
  FiSearch,
  FiPackage,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiCreditCard,
  FiGift,
  FiCheck,
  FiX,
  FiPrinter,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function VentasPage() {
  const { user } = useAuthStore();
  const { cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, processSale } = useSalesStore();
  const { products, searchProducts, getProductByBarcode, updateStock } = useProductStore();
  const { currentRegister, addSaleToRegister } = useCashRegisterStore();
  const { config } = useStoreConfigStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(true);

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountPaid, setAmountPaid] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isPackage, setIsPackage] = useState(false);

  useEffect(() => {
    const activeProducts = products.filter((p) => p.isActive && p.stock > 0);
    if (showAllProducts) {
      setSearchResults(activeProducts);
    }
  }, [products, showAllProducts]);

  useEffect(() => {
    if (paymentModalOpen) {
      setAmountPaid(getCartTotal().toFixed(2));
      setPaymentMethod('efectivo');
    }
  }, [paymentModalOpen, getCartTotal]);

  useEffect(() => {
    if (quantityModalOpen && selectedProduct) {
      setQuantity(selectedProduct.unit === 'kilo' || selectedProduct.unit === 'granel' ? '0.5' : '1');
      setIsPackage(false);
    }
  }, [quantityModalOpen, selectedProduct]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setShowAllProducts(true);
      return;
    }

    setShowAllProducts(false);
    const productByBarcode = getProductByBarcode(query);
    if (productByBarcode) {
      handleAddToCart(productByBarcode);
      toast.success(`${productByBarcode.name} agregado`);
      return;
    }

    const results = searchProducts(query);
    setSearchResults(results);

    if (results.length === 0) {
      toast.error('Producto no encontrado');
    } else if (results.length === 1) {
      setSelectedProduct(results[0]);
      setQuantityModalOpen(true);
    }
  };

  const handleAddToCart = (product: Product, isPkg = false) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }

    if (product.unit === 'kilo' || product.unit === 'granel' || product.unit === 'litro') {
      setSelectedProduct(product);
      setQuantityModalOpen(true);
      return;
    }

    addToCart(product, 1, isPkg);
    toast.success(`${product.name} agregado`, { duration: 1500 });
  };

  const handleConfirmQuantity = () => {
    const qty = parseFloat(quantity);
    if (selectedProduct && !isNaN(qty) && qty > 0) {
      addToCart(selectedProduct, qty, isPackage);
      toast.success(`${selectedProduct.name} agregado`, { duration: 1500 });
      setSelectedProduct(null);
      setQuantityModalOpen(false);
    }
  };

  const handlePayment = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (paymentMethod === 'efectivo' && paid < getCartTotal()) return;

    if (!currentRegister) {
      toast.error('La caja no está abierta');
      setPaymentModalOpen(false);
      return;
    }

    const sale = processSale(paymentMethod, paid, 0, currentRegister.id, user?.id);

    if (sale) {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          updateStock(item.productId, item.quantity, 'venta', `Venta ${sale.ticketNumber}`, sale.ticketNumber, user?.id);
        }
      });

      if (paymentMethod === 'efectivo') {
        addSaleToRegister(sale.total);
      }

      setLastSale(sale);
      setPaymentModalOpen(false);
      setTicketModalOpen(true);
      toast.success(`Venta completada: ${sale.ticketNumber}`);
    }
  };

  const cartTotal = getCartTotal();
  const change = Math.max(0, (parseFloat(amountPaid) || 0) - cartTotal);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      abarrotes: 'Abarrotes', bebidas: 'Bebidas', lacteos: 'Lácteos', carnes: 'Carnes',
      frutas_verduras: 'Frutas/Verduras', limpieza: 'Limpieza', higiene: 'Higiene',
      dulces: 'Dulces', botanas: 'Botanas', panaderia: 'Panadería', otros: 'Otros',
    };
    return labels[category] || category;
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', height: '100vh', background: '#030712' }}>
        {/* Panel Izquierdo - Productos */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              Ventas
            </h1>
          </div>

          {/* Barra de búsqueda */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '18px'
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                  setSearchQuery('');
                }
              }}
              placeholder="Escanear código o buscar producto..."
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                background: '#1d1d1d',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '300',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <span style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '11px',
              letterSpacing: '0.05em'
            }}>
              ENTER
            </span>
          </div>

          {/* Header de productos */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              {showAllProducts ? 'Productos' : `Resultados (${searchResults.length})`}
            </span>
            {!showAllProducts && (
              <button
                onClick={() => { setShowAllProducts(true); setSearchQuery(''); }}
                style={{
                  fontSize: '11px',
                  color: 'rgba(59, 130, 246, 0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Ver todos
              </button>
            )}
          </div>

          {/* Grid de productos */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
            {searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.3)' }}>
                <FiPackage size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px', fontWeight: '300' }}>No se encontraron productos</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px'
              }}>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    style={{
                      background: '#1d1d1d',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <div style={{
                      width: '100%',
                      height: '50px',
                      background: '#2a2a2a',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <FiPackage style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '24px' }} />
                    </div>

                    <p style={{
                      fontWeight: '400',
                      color: 'white',
                      fontSize: '13px',
                      marginBottom: '6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {product.name}
                    </p>

                    <p style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {getCategoryLabel(product.category)}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '300',
                        color: '#3b82f6'
                      }}>
                        ${product.salePrice.toFixed(2)}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: product.stock <= product.minStock ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.4)'
                      }}>
                        {product.stock}
                      </span>
                    </div>

                    {product.packagePrice && product.packageQuantity && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product, true); }}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          padding: '8px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '2px',
                          color: 'rgba(16, 185, 129, 0.9)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          letterSpacing: '0.02em'
                        }}
                      >
                        Paq ({product.packageQuantity}) ${product.packagePrice}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho - Carrito */}
        <div style={{
          width: '380px',
          background: '#1d1d1d',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header del carrito */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}>
                  Carrito
                </span>
                <span style={{
                  marginLeft: '12px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.3)'
                }}>
                  {cart.length} productos
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'none',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '2px',
                    color: 'rgba(239, 68, 68, 0.8)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    letterSpacing: '0.02em'
                  }}
                >
                  <FiTrash2 size={12} />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Alerta de caja */}
          {!currentRegister && (
            <div style={{
              margin: '16px',
              padding: '12px 16px',
              background: 'rgba(251, 191, 36, 0.05)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiAlertCircle style={{ color: 'rgba(251, 191, 36, 0.8)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'rgba(251, 191, 36, 0.9)', fontWeight: '300' }}>
                Abre la caja para vender
              </span>
            </div>
          )}

          {/* Items del carrito */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.3)' }}>
                <FiShoppingBag size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px', fontWeight: '300', marginBottom: '8px' }}>Carrito vacío</p>
                <p style={{ fontSize: '11px', fontWeight: '300', opacity: 0.7 }}>Escanea o busca productos</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.isPackage ? 'pkg' : 'unit'}`}
                    style={{
                      background: '#2a2a2a',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '2px',
                      padding: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: '400',
                          color: 'white',
                          fontSize: '13px',
                          marginBottom: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.product.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                            ${item.priceUsed.toFixed(2)}
                          </span>
                          {item.isPackage && (
                            <span style={{
                              padding: '2px 6px',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '2px',
                              color: 'rgba(16, 185, 129, 0.9)',
                              fontSize: '9px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Paq
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(239, 68, 68, 0.6)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1d1d1d',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '2px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer'
                          }}
                        >
                          <FiMinus size={12} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) updateCartItemQuantity(item.product.id, val);
                          }}
                          style={{
                            width: '50px',
                            height: '28px',
                            textAlign: 'center',
                            background: '#1d1d1d',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '2px',
                            color: 'white',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                          step={item.product.unit === 'kilo' || item.product.unit === 'granel' ? '0.1' : '1'}
                        />
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1d1d1d',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '2px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer'
                          }}
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '300', color: 'white' }}>
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer del carrito */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#1d1d1d'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}>
                Total
              </span>
              <span style={{
                fontSize: '32px',
                fontWeight: '300',
                color: 'white',
                letterSpacing: '-0.02em'
              }}>
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setPaymentModalOpen(true)}
              disabled={cart.length === 0 || !currentRegister}
              style={{
                width: '100%',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: cart.length === 0 || !currentRegister ? '#2a2a2a' : '#3b82f6',
                border: '1px solid',
                borderColor: cart.length === 0 || !currentRegister ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.5)',
                borderRadius: '2px',
                color: cart.length === 0 || !currentRegister ? 'rgba(255, 255, 255, 0.3)' : 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: cart.length === 0 || !currentRegister ? 'not-allowed' : 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              <FiDollarSign size={18} />
              Cobrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {paymentModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setPaymentModalOpen(false)}
          />
          <div style={{
            position: 'relative',
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '440px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}>
                Procesar Pago
              </span>
              <button
                onClick={() => setPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Total */}
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '2px',
                marginBottom: '24px'
              }}>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Total a Pagar
                </p>
                <p style={{ fontSize: '42px', fontWeight: '300', color: '#3b82f6', letterSpacing: '-0.02em' }}>
                  ${cartTotal.toFixed(2)}
                </p>
              </div>

              {/* Métodos de pago */}
              <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Método de Pago
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { value: 'efectivo' as PaymentMethod, label: 'Efectivo', icon: FiDollarSign },
                  { value: 'tarjeta' as PaymentMethod, label: 'Tarjeta', icon: FiCreditCard },
                  { value: 'vale' as PaymentMethod, label: 'Vale', icon: FiGift },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      background: paymentMethod === method.value ? 'rgba(59, 130, 246, 0.1)' : '#2a2a2a',
                      border: '1px solid',
                      borderColor: paymentMethod === method.value ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <method.icon size={20} style={{ color: paymentMethod === method.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)' }} />
                    <span style={{
                      fontSize: '11px',
                      color: paymentMethod === method.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'efectivo' && (
                <>
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Cantidad Recibida
                  </p>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#2a2a2a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '300',
                      textAlign: 'center',
                      outline: 'none',
                      marginBottom: '16px'
                    }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {[20, 50, 100, 200, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmountPaid(amt.toString())}
                        style={{
                          padding: '8px 16px',
                          background: '#2a2a2a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '2px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ${amt}
                      </button>
                    ))}
                    <button
                      onClick={() => setAmountPaid(cartTotal.toFixed(2))}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '2px',
                        color: 'rgba(16, 185, 129, 0.9)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Exacto
                    </button>
                  </div>

                  {change > 0 && (
                    <div style={{
                      padding: '20px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '2px',
                      textAlign: 'center',
                      marginBottom: '24px'
                    }}>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Cambio
                      </p>
                      <p style={{ fontSize: '36px', fontWeight: '300', color: '#10b981' }}>
                        ${change.toFixed(2)}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={paymentMethod === 'efectivo' && (parseFloat(amountPaid) || 0) < cartTotal}
                  style={{
                    flex: 1,
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: paymentMethod === 'efectivo' && (parseFloat(amountPaid) || 0) < cartTotal ? '#2a2a2a' : '#10b981',
                    border: '1px solid',
                    borderColor: paymentMethod === 'efectivo' && (parseFloat(amountPaid) || 0) < cartTotal ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.5)',
                    borderRadius: '2px',
                    color: paymentMethod === 'efectivo' && (parseFloat(amountPaid) || 0) < cartTotal ? 'rgba(255, 255, 255, 0.3)' : 'white',
                    fontSize: '12px',
                    cursor: paymentMethod === 'efectivo' && (parseFloat(amountPaid) || 0) < cartTotal ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <FiCheck size={16} />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cantidad */}
      {quantityModalOpen && selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => { setQuantityModalOpen(false); setSelectedProduct(null); }}
          />
          <div style={{
            position: 'relative',
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '380px'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Cantidad
              </span>
              <button
                onClick={() => { setQuantityModalOpen(false); setSelectedProduct(null); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                padding: '16px',
                background: '#2a2a2a',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '2px',
                marginBottom: '20px'
              }}>
                <p style={{ fontWeight: '400', color: 'white', fontSize: '14px', marginBottom: '8px' }}>
                  {selectedProduct.name}
                </p>
                <p style={{ fontSize: '18px', fontWeight: '300', color: '#3b82f6' }}>
                  ${selectedProduct.salePrice.toFixed(2)}
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginLeft: '6px' }}>
                    / {selectedProduct.unit === 'kilo' ? 'kg' : selectedProduct.unit === 'litro' ? 'L' : 'pza'}
                  </span>
                </p>
              </div>

              {selectedProduct.packagePrice && selectedProduct.packageQuantity && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setIsPackage(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: !isPackage ? 'rgba(59, 130, 246, 0.1)' : '#2a2a2a',
                      border: '1px solid',
                      borderColor: !isPackage ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: !isPackage ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Por Pieza
                  </button>
                  <button
                    onClick={() => setIsPackage(true)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: isPackage ? 'rgba(16, 185, 129, 0.1)' : '#2a2a2a',
                      border: '1px solid',
                      borderColor: isPackage ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: isPackage ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  >
                    <FiPackage size={14} />
                    Paquete
                  </button>
                </div>
              )}

              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#2a2a2a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '300',
                  textAlign: 'center',
                  outline: 'none',
                  marginBottom: '16px'
                }}
                step={selectedProduct.unit === 'kilo' || selectedProduct.unit === 'granel' ? '0.01' : '1'}
              />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {(selectedProduct.unit === 'kilo' || selectedProduct.unit === 'granel' ? [0.25, 0.5, 1, 1.5, 2] : [1, 2, 3, 5, 10]).map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setQuantity(qty.toString())}
                    style={{
                      padding: '8px 16px',
                      background: '#2a2a2a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {qty} {selectedProduct.unit === 'kilo' ? 'kg' : selectedProduct.unit === 'litro' ? 'L' : ''}
                  </button>
                ))}
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '2px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Total
                </span>
                <span style={{ fontSize: '24px', fontWeight: '300', color: '#3b82f6' }}>
                  ${((parseFloat(quantity) || 0) * (isPackage && selectedProduct.packagePrice ? selectedProduct.packagePrice : selectedProduct.salePrice)).toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setQuantityModalOpen(false); setSelectedProduct(null); }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmQuantity}
                  disabled={!quantity || parseFloat(quantity) <= 0}
                  style={{
                    flex: 1,
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: !quantity || parseFloat(quantity) <= 0 ? '#2a2a2a' : '#3b82f6',
                    border: '1px solid',
                    borderColor: !quantity || parseFloat(quantity) <= 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.5)',
                    borderRadius: '2px',
                    color: !quantity || parseFloat(quantity) <= 0 ? 'rgba(255, 255, 255, 0.3)' : 'white',
                    fontSize: '12px',
                    cursor: !quantity || parseFloat(quantity) <= 0 ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <FiCheck size={16} />
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ticket */}
      {ticketModalOpen && lastSale && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setTicketModalOpen(false)}
          />
          <div style={{
            position: 'relative',
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '380px'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Ticket de Venta
              </span>
              <button
                onClick={() => setTicketModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                background: 'white',
                borderRadius: '2px',
                padding: '20px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#1a1a1a',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{config.name}</p>
                  <p style={{ color: '#666', fontSize: '11px' }}>{config.address}</p>
                  <p style={{ color: '#666', fontSize: '11px' }}>Tel: {config.phone}</p>
                </div>

                <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px' }}>
                  <span>Ticket: {lastSale.ticketNumber}</span>
                  <span>{format(new Date(lastSale.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                </div>

                <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0' }} />

                {lastSale.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                    <span>{item.quantity} x {item.productName}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>TOTAL:</span>
                  <span>${lastSale.total.toFixed(2)}</span>
                </div>

                {lastSale.paymentMethod === 'efectivo' && (
                  <div style={{ marginTop: '8px', fontSize: '11px' }}>
                    <p>Recibido: ${lastSale.amountPaid.toFixed(2)}</p>
                    <p>Cambio: ${lastSale.change.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setTicketModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
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
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <FiX size={14} />
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '2px',
                    color: '#3b82f6',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <FiPrinter size={14} />
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
