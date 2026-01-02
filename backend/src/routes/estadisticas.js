import express from 'express';
import { 
  getResumen, 
  getGastosPorCategoria, 
  getEvolucionMensual 
} from '../controllers/estadisticasController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/resumen', getResumen);
router.get('/gastos-por-categoria', getGastosPorCategoria);
router.get('/evolucion-mensual', getEvolucionMensual);

export default router;
