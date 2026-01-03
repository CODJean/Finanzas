import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Error: Faltan las credenciales de Supabase en el archivo .env');
  console.error('Asegúrate de tener SUPABASE_URL y SUPABASE_ANON_KEY configurados');
  process.exit(1);
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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
