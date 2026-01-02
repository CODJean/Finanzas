import { supabase } from '../db/supabase.js';

export const getPresupuestos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('presupuestos')
      .select('*')
      .eq('usuario_id', req.user.userId)
      .order('mes', { ascending: false });

    if (error) throw error;

    res.json({ presupuestos: data });
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
};

export const createPresupuesto = async (req, res) => {
  try {
    const { categoria, monto_limite, mes } = req.body;

    if (!categoria || !monto_limite || !mes) {
      return res.status(400).json({ error: 'Categoría, monto límite y mes son requeridos' });
    }

    const { data, error } = await supabase
      .from('presupuestos')
      .insert([
        {
          usuario_id: req.user.userId,
          categoria,
          monto_limite,
          mes
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Presupuesto creado exitosamente',
      presupuesto: data 
    });
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    res.status(500).json({ error: 'Error al crear presupuesto' });
  }
};

export const updatePresupuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, monto_limite, mes } = req.body;

    const { data, error } = await supabase
      .from('presupuestos')
      .update({
        categoria,
        monto_limite,
        mes
      })
      .eq('id', id)
      .eq('usuario_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    res.json({ 
      message: 'Presupuesto actualizado exitosamente',
      presupuesto: data 
    });
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    res.status(500).json({ error: 'Error al actualizar presupuesto' });
  }
};

export const deletePresupuesto = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', req.user.userId);

    if (error) throw error;

    res.json({ message: 'Presupuesto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    res.status(500).json({ error: 'Error al eliminar presupuesto' });
  }
};
