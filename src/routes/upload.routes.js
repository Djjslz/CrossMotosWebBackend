import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import Image from '../models/Image.model.js';
import ApiError from '../utils/ApiError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new ApiError('Solo se permiten imágenes', 400));
  },
});

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.array('imagenes', 10),
  async (req, res, next) => {
    try {
      const archivos = req.files || [];
      if (archivos.length === 0) throw ApiError.badRequest('Selecciona al menos una imagen');

      const urls = [];
      for (const archivo of archivos) {
        const guardada = await Image.create({
          data: archivo.buffer,
          mimeType: archivo.mimetype,
          filename: archivo.originalname,
          size: archivo.size,
        });
        urls.push(`${req.protocol}://${req.get('host')}/api/uploads/${guardada._id}`);
      }

      res.status(201).json({ success: true, message: 'Imágenes subidas', data: { urls } });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', async (req, res, next) => {
  try {
    const imagen = await Image.findById(req.params.id);
    if (!imagen) throw ApiError.notFound('Imagen no encontrada');
    res.set('Content-Type', imagen.mimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(imagen.data);
  } catch (err) {
    next(err);
  }
});

export default router;