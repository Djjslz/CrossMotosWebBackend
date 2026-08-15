import { Router } from 'express';
import {
  listarInventario,
  listarAlertas,
  ajustarInventario,
} from '../controllers/inventory.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { ajusteInventarioSchema } from '../validations/product.validation.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', listarInventario);
router.get('/alertas', listarAlertas);
router.put('/:id', validate(ajusteInventarioSchema), ajustarInventario);

export default router;