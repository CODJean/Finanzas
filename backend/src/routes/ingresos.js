import express from 'express';
import { 
  getIngresos, 
  createIngreso, 
  updateIngreso, 
  deleteIngreso 
} from '../controllers/ingresosController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getIngresos);
router.post('/', createIngreso);
router.put('/:id', updateIngreso);
router.delete('/:id', deleteIngreso);

export default router;
