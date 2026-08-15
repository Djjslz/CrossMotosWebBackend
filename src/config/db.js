import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  const conn = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 30000 });
  console.log(`✅ Conectado a MongoDB: ${conn.connection.host}`);
  return conn;
}

export default connectDB;