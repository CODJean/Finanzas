import { supabase } from '../db/supabase.js';

export const getIngresos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .eq('usuario_id', req.user.userId)
      .order('fecha', { ascending: false });

    if (error) throw error;

    res.json({ ingresos: data });
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

export const createIngreso = async (req, res) => {
  try {
    const { monto, fuente, descripcion, fecha } = req.body;

    if (!monto || !fuente) {
      return res.status(400).json({ error: 'Monto y fuente son requeridos' });
    }

    const { data, error } = await supabase
      .from('ingresos')
      .insert([
        {
          usuario_id: req.user.userId,
          monto,
          fuente,
          descripcion: descripcion || null,
          fecha: fecha || new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Ingreso creado exitosamente',
      ingreso: data 
    });
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    res.status(500).json({ error: 'Error al crear ingreso' });
  }
};

export const updateIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, fuente, descripcion, fecha } = req.body;

    const { data, error } = await supabase
      .from('ingresos')
      .update({
        monto,
        fuente,
        descripcion,
        fecha
      })
      .eq('id', id)
      .eq('usuario_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    res.json({ 
      message: 'Ingreso actualizado exitosamente',
      ingreso: data 
    });
  } catch (error) {
    console.error('Error al actualizar ingreso:', error);
    res.status(500).json({ error: 'Error al actualizar ingreso' });
  }
};

export const deleteIngreso = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('ingresos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', req.user.userId);

    if (error) throw error;

    res.json({ message: 'Ingreso eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    res.status(500).json({ error: 'Error al eliminar ingreso' });
  }
};
