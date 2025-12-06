'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStoreConfigStore } from '../stores/storeConfig';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiSave, FiShoppingBag, FiInfo } from 'react-icons/fi';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { config, updateConfig } = useStoreConfigStore();

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
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500">Configura los datos de tu tienda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Info */}
          <Card>
            <CardHeader
              title="Información de la Tienda"
              subtitle="Estos datos aparecerán en los tickets"
            />
            <div className="space-y-4">
              <Input
                label="Nombre de la Tienda"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mi Tienda de Abarrotes"
                icon={<FiShoppingBag />}
              />
              <Input
                label="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle Principal #123, Col. Centro"
              />
              <Input
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-123-4567"
              />
              <Input
                label="RFC (opcional)"
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                placeholder="XAXX010101000"
              />
            </div>
          </Card>

          {/* Ticket Settings */}
          <Card>
            <CardHeader
              title="Configuración de Tickets"
              subtitle="Personaliza los tickets de venta"
            />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pie de Ticket
                </label>
                <textarea
                  value={formData.ticketFooter}
                  onChange={(e) =>
                    setFormData({ ...formData, ticketFooter: e.target.value })
                  }
                  placeholder="¡Gracias por su compra!&#10;Vuelva pronto"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este texto aparecerá al final de cada ticket
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa</p>
                <div className="bg-white border border-gray-200 rounded p-4 font-mono text-sm">
                  <div className="text-center mb-2">
                    <p className="font-bold">{formData.name || 'Nombre de la Tienda'}</p>
                    <p className="text-xs text-gray-500">{formData.address || 'Dirección'}</p>
                    <p className="text-xs text-gray-500">Tel: {formData.phone || '000-000-0000'}</p>
                    {formData.rfc && (
                      <p className="text-xs text-gray-500">RFC: {formData.rfc}</p>
                    )}
                  </div>
                  <div className="border-t border-dashed border-gray-300 my-2" />
                  <p className="text-center text-xs text-gray-500">...</p>
                  <div className="border-t border-dashed border-gray-300 my-2" />
                  <p className="text-center text-xs whitespace-pre-line">
                    {formData.ticketFooter || 'Pie de ticket'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Información del Sistema"
              subtitle="Datos técnicos del sistema"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiInfo className="text-blue-600" />
                  <span className="font-medium text-gray-900">Versión</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">1.0.0</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiInfo className="text-green-600" />
                  <span className="font-medium text-gray-900">Almacenamiento</span>
                </div>
                <p className="text-sm text-gray-600">LocalStorage (Navegador)</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiInfo className="text-purple-600" />
                  <span className="font-medium text-gray-900">Usuario</span>
                </div>
                <p className="text-sm text-gray-600">
                  {user?.name} ({user?.role})
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="primary" icon={<FiSave />} onClick={handleSave}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
