import React, { useState } from 'react';
import { createGasto, createIngreso } from '../../services/api';

const TransactionForm = ({ type, onClose }) => {
  const [formData, setFormData] = useState({
    monto: '',
    categoria: '',
    fuente: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoriasGastos = [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Ropa',
    'Otros'
  ];

  const fuentesIngresos = [
    'Salario',
    'Freelance',
    'Negocio',
    'Inversiones',
    'Regalo',
    'Otros'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'gasto') {
        await createGasto({
          monto: parseFloat(formData.monto),
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          fecha: formData.fecha
        });
      } else {
        await createIngreso({
          monto: parseFloat(formData.monto),
          fuente: formData.fuente,
          descripcion: formData.descripcion,
          fecha: formData.fecha
        });
      }
      onClose();
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {type === 'gasto' ? '➖ Agregar Gasto' : '➕ Agregar Ingreso'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Monto *</label>
            <input
              type="number"
              name="monto"
              step="0.01"
              className="input-field"
              placeholder="0.00"
              value={formData.monto}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              {type === 'gasto' ? 'Categoría *' : 'Fuente *'}
            </label>
            <select
              name={type === 'gasto' ? 'categoria' : 'fuente'}
              className="input-field"
              value={type === 'gasto' ? formData.categoria : formData.fuente}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una opción</option>
              {(type === 'gasto' ? categoriasGastos : fuentesIngresos).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              className="input-field"
              placeholder="Descripción opcional..."
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Fecha *</label>
            <input
              type="date"
              name="fecha"
              className="input-field"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 ${type === 'gasto' ? 'btn-primary' : 'btn-secondary'}`}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
