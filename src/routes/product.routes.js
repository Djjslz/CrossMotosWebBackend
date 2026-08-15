import { Router } from 'express';
import {
  listarProductos,
  listarDestacados,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
} from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  listarProductosQuery,
} from '../validations/product.validation.js';

const router = Router();

router.get('/', validate(listarProductosQuery, 'query'), listarProductos);
router.get('/destacados', listarDestacados);
router.get('/:slug', obtenerProducto);
router.post('/', authenticate, requireRole('admin'), validate(createProductSchema), crearProducto);
router.put('/:id', authenticate, requireRole('admin'), validate(updateProductSchema), actualizarProducto);
router.delete('/:id', authenticate, requireRole('admin'), desactivarProducto);

export default router;