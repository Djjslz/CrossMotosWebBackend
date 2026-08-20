import { Router } from 'express';
import multer from 'multer';
import {
  listarInventario,
  listarAlertas,
  ajustarInventario,
  exportarInventario,
  importarInventario,
} from '../controllers/inventory.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { ajusteInventarioSchema } from '../validations/product.validation.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.use(authenticate, requireRole('admin'));

router.get('/', listarInventario);
router.get('/alertas', listarAlertas);
router.get('/exportar', exportarInventario);
router.post('/importar', upload.single('archivo'), importarInventario);
router.put('/:id', validate(ajusteInventarioSchema), ajustarInventario);

export default router;