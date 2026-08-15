import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import sanitizeMiddleware from './middleware/sanitize.middleware.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

const limitadorGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones, intenta más tarde' },
});

app.use('/api', limitadorGeneral);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API CrossMotos funcionando', data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/inventario', inventoryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;