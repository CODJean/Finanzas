// backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './db/supabase.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import gastosRoutes from './routes/gastos.js';
import ingresosRoutes from './routes/ingresos.js';
import presupuestosRoutes from './routes/presupuestos.js';
import estadisticasRoutes from './routes/estadisticas.js'; // ← ASEGÚRATE QUE ESTÉ

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Probar conexión al iniciar
testConnection();

// Rutas
app.get('/', (req, res) => {
  res.json({ message: '✅ API de Finanzas funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/presupuestos', presupuestosRoutes);
app.use('/api/estadisticas', estadisticasRoutes); // ← ASEGÚRATE QUE ESTÉ

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: err.message 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
