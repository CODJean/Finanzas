import React, { useState } from 'react';
import { createPresupuesto, updatePresupuesto } from '../../services/api';

const BudgetForm = ({ budget, onClose }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    categoria: budget?.categoria || '',
    monto_limite: budget?.monto_limite || '',
    mes: budget?.mes || currentMonth,
    anio: budget?.anio || currentYear
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categorias = [
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

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
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
      const dataToSend = {
        categoria: formData.categoria,
        monto_limite: parseFloat(formData.monto_limite),
        mes: `${formData.anio}-${String(formData.mes).padStart(2, '0')}`
      };

      if (budget) {
        await updatePresupuesto(budget.id, dataToSend);
      } else {
        await createPresupuesto(dataToSend);
      }
      
      onClose();
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {budget ? '✏️ Editar Presupuesto' : '➕ Nuevo Presupuesto'}
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
            <label className="block text-gray-700 mb-2">Categoría *</label>
            <select
              name="categoria"
              className="input-field"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Monto Límite *</label>
            <input
              type="number"
              name="monto_limite"
              step="0.01"
              className="input-field"
              placeholder="1000.00"
              value={formData.monto_limite}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Mes *</label>
              <select
                name="mes"
                className="input-field"
                value={formData.mes}
                onChange={handleChange}
                required
              >
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Año *</label>
              <input
                type="number"
                name="anio"
                className="input-field"
                value={formData.anio}
                onChange={handleChange}
                min="2020"
                max="2030"
                required
              />
            </div>
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
              className="flex-1 btn-primary"
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

export default BudgetForm;
