import express from 'express';
import { 
  getPresupuestos, 
  createPresupuesto, 
  updatePresupuesto, 
  deletePresupuesto 
} from '../controllers/presupuestosController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getPresupuestos);
router.post('/', createPresupuesto);
router.put('/:id', updatePresupuesto);
router.delete('/:id', deletePresupuesto);

export default router;
