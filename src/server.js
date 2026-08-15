import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`🚀 Servidor CrossMotos corriendo en http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('❌ No se pudo iniciar el servidor:', err.message);
  process.exit(1);
});