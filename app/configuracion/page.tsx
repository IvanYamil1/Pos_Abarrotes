'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useStoreConfigStore } from '../stores/storeConfig';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiSave, FiShoppingBag, FiInfo, FiMapPin, FiPhone, FiFileText } from 'react-icons/fi';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { config, updateConfig } = useStoreConfigStore();
  const { colors } = useThemeStore();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    rfc: '',
    ticketFooter: '',
  });

  useEffect(() => {
    // Solo admin puede acceder
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Cargar configuración actual
    setFormData({
      name: config.name || '',
      address: config.address || '',
      phone: config.phone || '',
      rfc: config.rfc || '',
      ticketFooter: config.ticketFooter || '',
    });
  }, [config, user, router]);

  const handleSave = () => {
    updateConfig(formData);
    toast.success('Configuración guardada');
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div style={{ padding: '20px', background: colors.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: colors.textSecondary,
            marginBottom: '12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            Configuración
          </h1>
          <p style={{
            color: colors.textMuted,
            fontSize: '14px',
            fontWeight: '300',
            letterSpacing: '0.02em'
          }}>
            Configura los datos de tu tienda
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Store Info */}
          <div style={{
            background: colors.bgSecondary,
            borderRadius: '2px',
            padding: '24px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <h2 style={{
                fontSize: '11px',
                fontWeight: '500',
                color: colors.textMuted,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                Información de la Tienda
              </h2>
              <p style={{ fontSize: '12px', color: colors.textMuted }}>
                Estos datos aparecerán en los tickets
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Nombre */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Nombre de la Tienda
                </label>
                <div style={{ position: 'relative' }}>
                  <FiShoppingBag style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.textMuted,
                    fontSize: '16px'
                  }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mi Tienda de Abarrotes"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: colors.bgTertiary,
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: '2px',
                      color: colors.textPrimary,
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Dirección
                </label>
                <div style={{ position: 'relative' }}>
                  <FiMapPin style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.textMuted,
                    fontSize: '16px'
                  }} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle Principal #123, Col. Centro"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: colors.bgTertiary,
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: '2px',
                      color: colors.textPrimary,
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Teléfono
                </label>
                <div style={{ position: 'relative' }}>
                  <FiPhone style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.textMuted,
                    fontSize: '16px'
                  }} />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="555-123-4567"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: colors.bgTertiary,
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: '2px',
                      color: colors.textPrimary,
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* RFC */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  RFC (opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <FiFileText style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.textMuted,
                    fontSize: '16px'
                  }} />
                  <input
                    type="text"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                    placeholder="XAXX010101000"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: colors.bgTertiary,
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: '2px',
                      color: colors.textPrimary,
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Settings */}
          <div style={{
            background: colors.bgSecondary,
            borderRadius: '2px',
            padding: '24px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <h2 style={{
                fontSize: '11px',
                fontWeight: '500',
                color: colors.textMuted,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                Configuración de Tickets
              </h2>
              <p style={{ fontSize: '12px', color: colors.textMuted }}>
                Personaliza los tickets de venta
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Pie de Ticket */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.textMuted,
                  marginBottom: '8px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Pie de Ticket
                </label>
                <textarea
                  value={formData.ticketFooter}
                  onChange={(e) => setFormData({ ...formData, ticketFooter: e.target.value })}
                  placeholder="¡Gracias por su compra!&#10;Vuelva pronto"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: '2px',
                    color: colors.textPrimary,
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '100px',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '8px' }}>
                  Este texto aparecerá al final de cada ticket
                </p>
              </div>

              {/* Preview */}
              <div style={{
                padding: '16px',
                background: colors.bgTertiary,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '2px'
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: colors.textMuted,
                  marginBottom: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Vista Previa
                </p>
                <div style={{
                  background: 'white',
                  borderRadius: '2px',
                  padding: '16px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#1d1d1d'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {formData.name || 'Nombre de la Tienda'}
                    </p>
                    <p style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                      {formData.address || 'Dirección'}
                    </p>
                    <p style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                      Tel: {formData.phone || '000-000-0000'}
                    </p>
                    {formData.rfc && (
                      <p style={{ fontSize: '10px', color: '#666' }}>RFC: {formData.rfc}</p>
                    )}
                  </div>
                  <div style={{
                    borderTop: '1px dashed #ccc',
                    margin: '8px 0'
                  }} />
                  <p style={{ textAlign: 'center', fontSize: '10px', color: '#999' }}>...</p>
                  <div style={{
                    borderTop: '1px dashed #ccc',
                    margin: '8px 0'
                  }} />
                  <p style={{
                    textAlign: 'center',
                    fontSize: '10px',
                    whiteSpace: 'pre-line',
                    color: '#666'
                  }}>
                    {formData.ticketFooter || 'Pie de ticket'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '2px',
          padding: '24px',
          border: `1px solid ${colors.borderColor}`,
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: colors.textMuted,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Información del Sistema
            </h2>
            <p style={{ fontSize: '12px', color: colors.textMuted }}>
              Datos técnicos del sistema
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{
              padding: '20px',
              background: colors.accentBg,
              border: `1px solid ${colors.accentBorder}`,
              borderRadius: '2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FiInfo style={{ color: colors.accent, fontSize: '16px' }} />
                <span style={{ fontWeight: '500', color: colors.textSecondary, fontSize: '13px' }}>Versión</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '300', color: colors.accent, letterSpacing: '-0.02em' }}>1.0.0</p>
            </div>

            <div style={{
              padding: '20px',
              background: colors.successBg,
              border: `1px solid ${colors.successBorder}`,
              borderRadius: '2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FiInfo style={{ color: colors.success, fontSize: '16px' }} />
                <span style={{ fontWeight: '500', color: colors.textSecondary, fontSize: '13px' }}>Almacenamiento</span>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary }}>LocalStorage (Navegador)</p>
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FiInfo style={{ color: '#8b5cf6', fontSize: '16px' }} />
                <span style={{ fontWeight: '500', color: colors.textSecondary, fontSize: '13px' }}>Usuario</span>
              </div>
              <p style={{ fontSize: '14px', color: colors.textSecondary }}>
                {user?.name} ({user?.role})
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '2px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
            }}
          >
            <FiSave size={16} />
            Guardar Configuración
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
