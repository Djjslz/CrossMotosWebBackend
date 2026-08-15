import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.model.js';
import { env } from './config/env.js';

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: 'davidez@crossmotos.com' });
  if (existing) {
    console.log('👤 Admin ya existe, actualizando credenciales...');
    existing.nombre = 'Davidez';
    existing.email = 'davidez@crossmotos.com';
    existing.password = env.adminPassword;
    existing.rol = 'admin';
    await existing.save();
  } else {
    await User.create({
      nombre: 'Davidez',
      email: 'davidez@crossmotos.com',
      password: env.adminPassword,
      rol: 'admin',
    });
  }

  console.log(`✅ Usuario admin listo: ${env.adminUser}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});