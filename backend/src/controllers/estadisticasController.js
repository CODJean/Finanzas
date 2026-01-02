// backend/src/controllers/estadisticasController.js
import { supabase } from '../db/supabase.js';

// Obtener resumen general
export const getResumen = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener total de ingresos
    const { data: ingresos, error: ingresosError } = await supabase
      .from('ingresos')
      .select('monto')
      .eq('usuario_id', userId);

    if (ingresosError) throw ingresosError;

    // Obtener total de gastos
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos')
      .select('monto')
      .eq('usuario_id', userId);

    if (gastosError) throw gastosError;

    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
    const totalGastos = gastos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
    const saldo = totalIngresos - totalGastos;

    res.json({
      totalIngresos: totalIngresos.toFixed(2),
      totalGastos: totalGastos.toFixed(2),
      saldo: saldo.toFixed(2),
      cantidadIngresos: ingresos.length,
      cantidadGastos: gastos.length
    });
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

// Obtener gastos por categoría
export const getGastosPorCategoria = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gastos')
      .select('categoria, monto')
      .eq('usuario_id', req.user.userId);

    if (error) throw error;

    // Agrupar por categoría
    const grouped = data.reduce((acc, item) => {
      const categoria = item.categoria || 'Sin categoría';
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += parseFloat(item.monto);
      return acc;
    }, {});

    // Convertir a array para gráficos
    const resultado = Object.entries(grouped).map(([categoria, total]) => ({
      categoria,
      total: parseFloat(total.toFixed(2))
    }));

    res.json({ gastosPorCategoria: resultado });
  } catch (error) {
    console.error('Error al obtener gastos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener gastos por categoría' });
  }
};

// Obtener evolución mensual
export const getEvolucionMensual = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener ingresos por mes
    const { data: ingresos, error: ingresosError } = await supabase
      .from('ingresos')
      .select('monto, fecha')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: true });

    if (ingresosError) throw ingresosError;

    // Obtener gastos por mes
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos')
      .select('monto, fecha')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: true });

    if (gastosError) throw gastosError;

    // Agrupar por mes
    const agruparPorMes = (items) => {
      return items.reduce((acc, item) => {
        const fecha = new Date(item.fecha);
        const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[mes]) {
          acc[mes] = 0;
        }
        acc[mes] += parseFloat(item.monto);
        return acc;
      }, {});
    };

    const ingresosPorMes = agruparPorMes(ingresos);
    const gastosPorMes = agruparPorMes(gastos);

    // Combinar datos
    const meses = [...new Set([...Object.keys(ingresosPorMes), ...Object.keys(gastosPorMes)])].sort();
    
    const evolucion = meses.map(mes => ({
      mes,
      ingresos: parseFloat((ingresosPorMes[mes] || 0).toFixed(2)),
      gastos: parseFloat((gastosPorMes[mes] || 0).toFixed(2)),
      saldo: parseFloat(((ingresosPorMes[mes] || 0) - (gastosPorMes[mes] || 0)).toFixed(2))
    }));

    res.json({ evolucion });
  } catch (error) {
    console.error('Error al obtener evolución mensual:', error);
    res.status(500).json({ error: 'Error al obtener evolución mensual' });
  }
};
