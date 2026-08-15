import { Router } from 'express';
import {
  listarCategorias,
  listarTodasCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';

const router = Router();

router.get('/', listarCategorias);
router.get('/todas', authenticate, requireRole('admin'), listarTodasCategorias);
router.post('/', authenticate, requireRole('admin'), validate(createCategorySchema), crearCategoria);
router.put('/:id', authenticate, requireRole('admin'), validate(updateCategorySchema), actualizarCategoria);
router.delete('/:id', authenticate, requireRole('admin'), eliminarCategoria);

export default router;