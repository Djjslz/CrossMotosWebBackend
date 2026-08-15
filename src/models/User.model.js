import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
    activo: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.compararPassword = function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

const User = model('User', userSchema);

export default User;