import React, { useState, useEffect } from 'react';
import { getGastos } from '../../services/api';

const BudgetProgress = ({ presupuesto, onEdit, onDelete }) => {
  const [gastado, setGastado] = useState(0);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  calcularGastado();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [presupuesto]);

  const calcularGastado = async () => {
    try {
      const response = await getGastos();
      const gastos = response.data.gastos;

      // Filtrar gastos del mes y categoría del presupuesto
      const [year, month] = presupuesto.mes.split('-');
      const gastosDelMes = gastos.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return (
          gasto.categoria === presupuesto.categoria &&
          fechaGasto.getFullYear() === parseInt(year) &&
          fechaGasto.getMonth() + 1 === parseInt(month)
        );
      });

      const totalGastado = gastosDelMes.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
      setGastado(totalGastado);
    } catch (error) {
      console.error('Error al calcular gastado:', error);
    } finally {
      setLoading(false);
    }
  };

  const porcentaje = (gastado / presupuesto.monto_limite) * 100;
  const restante = presupuesto.monto_limite - gastado;

  const getColorClass = () => {
    if (porcentaje >= 100) return 'bg-red-500';
    if (porcentaje >= 80) return 'bg-orange-500';
    if (porcentaje >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColorClass = () => {
    if (porcentaje >= 100) return 'text-red-700';
    if (porcentaje >= 80) return 'text-orange-700';
    return 'text-gray-700';
  };

  const formatMes = (mesStr) => {
    const [year, month] = mesStr.split('-');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return <div className="card">Cargando...</div>;
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{presupuesto.categoria}</h3>
          <p className="text-sm text-gray-600">{formatMes(presupuesto.mes)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(presupuesto)}
            className="text-blue-500 hover:text-blue-700 p-1"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(presupuesto.id)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className={getTextColorClass()}>
            ${gastado.toFixed(2)} de ${presupuesto.monto_limite}
          </span>
          <span className={getTextColorClass()}>
            {porcentaje.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${getColorClass()}`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Restante: 
        </span>
        <span className={`font-semibold ${restante < 0 ? 'text-red-700' : 'text-green-700'}`}>
          ${restante.toFixed(2)}
        </span>
      </div>

      {porcentaje >= 80 && porcentaje < 100 && (
        <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-700">
          ⚠️ ¡Cuidado! Ya usaste el {porcentaje.toFixed(0)}% del presupuesto
        </div>
      )}

      {porcentaje >= 100 && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
          🚨 ¡Presupuesto excedido! Te pasaste ${Math.abs(restante).toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
