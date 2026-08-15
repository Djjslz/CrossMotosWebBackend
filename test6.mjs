import 'dotenv/config';
import mongoose from 'mongoose';
let ok = false;
for (let i = 1; i <= 6 && !ok; i++) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`INTENTO ${i}: CONECTADO a ${mongoose.connection.name}`);
    ok = true;
    await mongoose.disconnect();
  } catch (e) {
    console.log(`INTENTO ${i}: ${e.message.split(" at ")[0].slice(0,80)}`);
    await new Promise(r => setTimeout(r, 15000));
  }
}
process.exit(ok ? 0 : 1);
