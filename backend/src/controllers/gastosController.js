import { supabase } from '../db/supabase.js';

export const getGastos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('usuario_id', req.user.userId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    res.json({ gastos: data });
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

export const createGasto = async (req, res) => {
  try {
    const { monto, categoria, descripcion, fecha } = req.body;

    if (!monto || !categoria) {
      return res.status(400).json({ error: 'Monto y categoría son requeridos' });
    }

    const { data, error } = await supabase
      .from('gastos')
      .insert([
        {
          usuario_id: req.user.userId,
          monto,
          categoria,
          descripcion: descripcion || null,
          fecha: fecha || new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Gasto creado exitosamente',
      gasto: data 
    });
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({ error: 'Error al crear gasto' });
  }
};

export const updateGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, categoria, descripcion, fecha } = req.body;

    const { data, error } = await supabase
      .from('gastos')
      .update({
        monto,
        categoria,
        descripcion,
        fecha
      })
      .eq('id', id)
      .eq('usuario_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    res.json({ 
      message: 'Gasto actualizado exitosamente',
      gasto: data 
    });
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({ error: 'Error al actualizar gasto' });
  }
};

export const deleteGasto = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', req.user.userId);

    if (error) throw error;

    res.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};
