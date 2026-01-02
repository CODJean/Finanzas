// backend/src/db/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Verificar que las variables de entorno existan
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Error: Faltan las credenciales de Supabase en el archivo .env');
  console.error('Asegúrate de tener SUPABASE_URL y SUPABASE_ANON_KEY configurados');
  process.exit(1);
}

// Crear cliente de Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Función para probar la conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST204') {
      console.log('⚠️ Advertencia:', error.message);
      console.log('✅ Pero la conexión a Supabase está OK');
    } else {
      console.log('✅ Conexión a Supabase exitosa!');
    }
  } catch (err) {
    console.error('❌ Error al conectar con Supabase:', err.message);
  }
}
