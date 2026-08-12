import express from 'express';
import { env } from './config/env.js';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API CrossMotos funcionando', data: { status: 'ok' } });
});

export default app;
