import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getGastosPorCategoria, getEvolucionMensual } from '../../services/api';

const Charts = () => {
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [evolucion, setEvolucion] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const [gastosRes, evolucionRes] = await Promise.all([
        getGastosPorCategoria(),
        getEvolucionMensual()
      ]);

      setGastosPorCategoria(gastosRes.data.gastosPorCategoria);
      setEvolucion(evolucionRes.data.evolucion);
    } catch (error) {
      console.error('Error al cargar gráficos:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10a693', '#0066e6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return <div className="text-center py-8">Cargando gráficos...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de Gastos por Categoría */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Gastos por Categoría</h3>
        {gastosPorCategoria.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gastosPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, total }) => `${categoria}: $${total}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {gastosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos para mostrar</p>
        )}
      </div>

      {/* Gráfico de Evolución Mensual */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Evolución Mensual</h3>
        {evolucion.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#10a693" strokeWidth={2} name="Ingresos" />
              <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} name="Gastos" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos para mostrar</p>
        )}
      </div>

      {/* Gráfico de Barras Comparativo */}
      <div className="card lg:col-span-2">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Comparativo Mensual</h3>
        {evolucion.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#10a693" name="Ingresos" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
              <Bar dataKey="saldo" fill="#0066e6" name="Saldo" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos para mostrar</p>
        )}
      </div>
    </div>
  );
};

export default Charts;
